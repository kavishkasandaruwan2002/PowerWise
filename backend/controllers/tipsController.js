const mongoose = require('mongoose');
const TipInteraction = require('../models/TipInteraction');
const EnergyTip = require('../models/EnergyTip');
const { getWeatherState } = require('../services/weatherService');
const { recommendTips } = require('../services/tipRecommendationService');

function toObjectId(id) {
  try {
    return new mongoose.Types.ObjectId(String(id));
  } catch {
    return null;
  }
}

/**
 * GET /api/v1/tips/recommendations
 * Query: limit (lat/lon read from user profile; income is fixed to LOW)
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user?._id;
    const householdId = req.user?.household;
    const location = req.user?.location;

    if (!userId || !householdId) {
      console.log(`TIPS CONTROLLER - SKIPPING RECOMMENDATIONS (NO HOUSEHOLD) | USER: ${userId}`);
      return res.status(200).json({ 
        success: true, 
        data: { recommendations: [], message: 'Please set up your household profile to get personalized tips.' } 
      });
    }

    // Requirements:
    // - Always use LOW income focus
    // - Always fetch weather from free 3rd-party API (no caching)
    // - Get {lat, lon} from the user profile (User schema)
    const incomeTag = 'LOW';
    const lat = location?.lat;
    const lon = location?.lon;

    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) {
      return res.status(400).json({
        success: false,
        message: 'User location is not set. Update your profile with { lat, lon } before requesting recommendations.'
      });
    }

    const limit = Number(req.query.limit || 5);

    const weather = await getWeatherState({ lat, lon });

    const data = await recommendTips({
      userId,
      householdId,
      incomeTag,
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
    const userId = req.user?._id;
    const householdId = req.user?.household;
    const docs = await TipInteraction.find({ userId, householdId })
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
    const userId = toObjectId(req.user?._id);
    const householdId = toObjectId(req.user?.household);

    if (!userId || !householdId) {
      return res.status(400).json({ success: false, message: 'Please set up your household profile before managing tips.' });
    }

    const tipExists = await EnergyTip.exists({ _id: tipId, isActive: true });
    if (!tipExists) {
      return res.status(404).json({ success: false, message: 'Tip not found' });
    }

    const doc = await TipInteraction.findOneAndUpdate(
      { userId, householdId, tipId },
      { $set: { bookmarked: true } },
      { new: true, upsert: true }
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
    const userId = toObjectId(req.user?.id);
    const householdId = toObjectId(req.user?.householdId);

    const doc = await TipInteraction.findOneAndUpdate(
      { userId, householdId, tipId },
      { $set: { bookmarked: false } },
      { new: true }
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
    const userId = req.user?._id;
    const householdId = req.user?.household;
    const location = req.user?.location;

    if (!userId || !householdId) {
      return res.status(400).json({ success: false, message: 'Please set up your household profile before implementing tips.' });
    }

    const tip = await EnergyTip.findById(tipId);
    if (!tip || !tip.isActive) {
      return res.status(404).json({ success: false, message: 'Tip not found' });
    }

    const incomeTag = 'LOW';
    const lat = location?.lat;
    const lon = location?.lon;

    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) {
      return res.status(400).json({
        success: false,
        message: 'User location is not set. Update your profile with { lat, lon } before implementing a tip.'
      });
    }

    // Recompute estimates now and store snapshot at implementation time.
    const weather = await getWeatherState({ lat, lon });
    const rec = await recommendTips({ userId, householdId, incomeTag, weather, limit: 50 });
    const match = rec.recommendations.find(r => String(r.tip._id) === String(tipId));

    const savingsSnapshot = match
      ? {
          kwhMonthly: match.estimatedSavings.kwhMonthly,
          lkrMonthly: match.estimatedSavings.lkrMonthly,
          baselineKwhMonthly: match.baseline.kwhMonthly,
          baselineBillLkr: match.baseline.billLkr,
          newBillLkr: match.baseline.billLkr != null && match.estimatedSavings.lkrMonthly != null
            ? Number((match.baseline.billLkr - match.estimatedSavings.lkrMonthly).toFixed(2))
            : null,
          tariffPlanId: null
        }
      : undefined;

    const doc = await TipInteraction.findOneAndUpdate(
      { userId, householdId, tipId },
      {
        $set: {
          implemented: true,
          implementedAt: new Date(),
          savingsSnapshot
        }
      },
      { new: true, upsert: true }
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
    const userId = toObjectId(req.user?._id);
    const householdId = toObjectId(req.user?.household);
    if (!userId || !householdId) {
      return res.status(400).json({ success: false, message: 'Please set up your household profile before providing feedback.' });
    }

    const doc = await TipInteraction.findOneAndUpdate(
      { userId, householdId, tipId },
      {
        $set: {
          feedback: {
            rating: req.body.rating,
            comment: req.body.comment,
            updatedAt: new Date()
          }
        }
      },
      { new: true, upsert: true }
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
    const userId = toObjectId(req.user?._id);
    const householdId = toObjectId(req.user?.household);
    const days = Number(req.body?.days || 14);
    const dismissedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const doc = await TipInteraction.findOneAndUpdate(
      { userId, householdId, tipId },
      { $set: { dismissedUntil } },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: `Dismissed for ${days} day(s)`, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
