const mongoose = require('mongoose');
const TipInteraction = require('../models/TipInteraction');
const EnergyTip = require('../models/EnergyTip');
const Household = require('../models/Household');
const { getWeatherState } = require('../services/weatherService');
const { recommendTips } = require('../services/tipRecommendationService');

function toObjectId(id) {
  try {
    return new mongoose.Types.ObjectId(String(id));
  } catch {
    return null;
  }
}

function mapIncomeBracketToTag(incomeBracket) {
  const value = String(incomeBracket || '').toLowerCase();
  if (value === 'low') return 'LOW';
  if (value === 'middle' || value === 'mid') return 'MID';
  if (value === 'high') return 'HIGH';
  return 'ALL';
}

async function getUserContext(req) {
  const userId = req.user?._id || req.user?.id;
  const householdId = req.user?.household || req.user?.householdId;

  if (!userId || !householdId) {
    return {
      userId: null,
      householdId: null,
      household: null,
      incomeTag: 'ALL',
      lat: null,
      lon: null
    };
  }

  const household = await Household.findById(householdId).lean();

  const incomeTag = mapIncomeBracketToTag(
    household?.incomeBracket || req.user?.incomeBracket
  );

  const lat = household?.location?.latitude ?? req.user?.location?.lat ?? null;
  const lon = household?.location?.longitude ?? req.user?.location?.lon ?? null;

  return {
    userId,
    householdId,
    household,
    incomeTag,
    lat: Number(lat),
    lon: Number(lon)
  };
}

async function ensureActiveTip(tipId) {
  if (!mongoose.isValidObjectId(tipId)) {
    return null;
  }

  return EnergyTip.findOne({ _id: tipId, isActive: true });
}

/**
 * GET /api/v1/tips/recommendations
 * Query: limit (lat/lon read from user profile; income is fixed to LOW)
 */
exports.getRecommendations = async (req, res) => {
  try {
    const context = await getUserContext(req);

    if (!context.userId || !context.householdId) {
      return res.status(200).json({
        success: true,
        data: {
          recommendations: [],
          meta: null,
          message: 'Please create a household profile first to get personalized tips.'
        }
      });
    }

    if (!Number.isFinite(context.lat) || !Number.isFinite(context.lon)) {
      return res.status(400).json({
        success: false,
        message: 'Household location is missing. Please update the household with latitude and longitude.'
      });
    }

    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 5));
    const weather = await getWeatherState({ lat: context.lat, lon: context.lon });

    const data = await recommendTips({
      userId: context.userId,
      householdId: context.householdId,
      incomeTag: context.incomeTag,
      weather,
      limit
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * GET /api/v1/tips/interactions
 */
exports.getMyInteractions = async (req, res) => {
  try {
    const context = await getUserContext(req);

    if (!context.userId || !context.householdId) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const docs = await TipInteraction.find({
      userId: context.userId,
      householdId: context.householdId
    })
      .populate('tipId')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * POST /api/v1/tips/:tipId/bookmark
 */
exports.bookmarkTip = async (req, res) => {
  try {
    const { tipId } = req.params;
    const context = await getUserContext(req);

    if (!context.userId || !context.householdId) {
      return res.status(400).json({
        success: false,
        message: 'Please create a household profile before bookmarking tips.'
      });
    }

    const tip = await ensureActiveTip(tipId);
    if (!tip) {
      return res.status(404).json({ success: false, message: 'Tip not found' });
    }

    const doc = await TipInteraction.findOneAndUpdate(
      {
        userId: toObjectId(context.userId),
        householdId: toObjectId(context.householdId),
        tipId: toObjectId(tipId)
      },
      {
        $set: { bookmarked: true }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    res.status(200).json({ success: true, message: 'Bookmarked', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/tips/:tipId/unbookmark
 */
exports.unbookmarkTip = async (req, res) => {
  try {
    const { tipId } = req.params;
    const context = await getUserContext(req);

    if (!context.userId || !context.householdId) {
      return res.status(400).json({
        success: false,
        message: 'Please create a household profile before updating tip bookmarks.'
      });
    }

    const tip = await ensureActiveTip(tipId);
    if (!tip) {
      return res.status(404).json({ success: false, message: 'Tip not found' });
    }

    const doc = await TipInteraction.findOneAndUpdate(
      {
        userId: toObjectId(context.userId),
        householdId: toObjectId(context.householdId),
        tipId: toObjectId(tipId)
      },
      {
        $set: { bookmarked: false }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    res.status(200).json({ success: true, message: 'Unbookmarked', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * POST /api/v1/tips/:tipId/implement
 * Body: { lat, lon, incomeTag } (optional; used to snapshot weather and savings)
 */
exports.implementTip = async (req, res) => {
  try {
    const { tipId } = req.params;
    const context = await getUserContext(req);

    if (!context.userId || !context.householdId) {
      return res.status(400).json({
        success: false,
        message: 'Please create a household profile before implementing tips.'
      });
    }

    if (!Number.isFinite(context.lat) || !Number.isFinite(context.lon)) {
      return res.status(400).json({
        success: false,
        message: 'Household location is missing. Please update the household with latitude and longitude.'
      });
    }

    const tip = await ensureActiveTip(tipId);
    if (!tip) {
      return res.status(404).json({ success: false, message: 'Tip not found' });
    }

    const weather = await getWeatherState({ lat: context.lat, lon: context.lon });
    const rec = await recommendTips({
      userId: context.userId,
      householdId: context.householdId,
      incomeTag: context.incomeTag,
      weather,
      limit: 50
    });

    const match = rec.recommendations.find(
      (item) => String(item.tip._id) === String(tipId)
    );

    const savingsSnapshot = match
      ? {
          kwhMonthly: match.estimatedSavings.kwhMonthly,
          lkrMonthly: match.estimatedSavings.lkrMonthly,
          baselineKwhMonthly: match.baseline.kwhMonthly,
          baselineBillLkr: match.baseline.billLkr,
          newBillLkr:
            match.baseline.billLkr != null && match.estimatedSavings.lkrMonthly != null
              ? Number((match.baseline.billLkr - match.estimatedSavings.lkrMonthly).toFixed(2))
              : null,
          tariffPlanId: null
        }
      : undefined;

    const doc = await TipInteraction.findOneAndUpdate(
      {
        userId: toObjectId(context.userId),
        householdId: toObjectId(context.householdId),
        tipId: toObjectId(tipId)
      },
      {
        $set: {
          implemented: true,
          implementedAt: new Date(),
          savingsSnapshot
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    res.status(200).json({ success: true, message: 'Marked as implemented', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * POST /api/v1/tips/:tipId/feedback
 */
exports.feedbackTip = async (req, res) => {
  try {
    const { tipId } = req.params;
    const context = await getUserContext(req);

    if (!context.userId || !context.householdId) {
      return res.status(400).json({
        success: false,
        message: 'Please create a household profile before giving feedback.'
      });
    }

    const tip = await ensureActiveTip(tipId);
    if (!tip) {
      return res.status(404).json({ success: false, message: 'Tip not found' });
    }

    const doc = await TipInteraction.findOneAndUpdate(
      {
        userId: toObjectId(context.userId),
        householdId: toObjectId(context.householdId),
        tipId: toObjectId(tipId)
      },
      {
        $set: {
          feedback: {
            rating: req.body.rating,
            comment: req.body.comment,
            updatedAt: new Date()
          }
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    res.status(200).json({ success: true, message: 'Feedback saved', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * POST /api/v1/tips/:tipId/dismiss
 * Body: { days }
 */
exports.dismissTip = async (req, res) => {
  try {
    const { tipId } = req.params;
    const context = await getUserContext(req);
    const days = Number(req.body?.days || 14);
    const dismissedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    if (!context.userId || !context.householdId) {
      return res.status(400).json({
        success: false,
        message: 'Please create a household profile before dismissing tips.'
      });
    }

    const tip = await ensureActiveTip(tipId);
    if (!tip) {
      return res.status(404).json({ success: false, message: 'Tip not found' });
    }

    const doc = await TipInteraction.findOneAndUpdate(
      {
        userId: toObjectId(context.userId),
        householdId: toObjectId(context.householdId),
        tipId: toObjectId(tipId)
      },
      {
        $set: { dismissedUntil }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: `Dismissed for ${days} day(s)`,
      data: doc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
