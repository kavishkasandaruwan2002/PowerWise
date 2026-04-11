const EnergyTip = require('../models/EnergyTip');

function buildAdminTipFilter(query = {}) {
  const { isActive, q, category } = query;
  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = String(isActive) === 'true';
  }

  if (category) {
    filter.category = category;
  }

  if (q && String(q).trim()) {
    filter.$or = [
      { title: { $regex: String(q).trim(), $options: 'i' } },
      { description: { $regex: String(q).trim(), $options: 'i' } }
    ];
  }

  return filter;
}

/**
 * POST /api/v1/admin/tips
 */
exports.createTip = async (req, res) => {
  try {
    const payload = {
      ...req.body,
    createdBy: req.user?._id || req.user?.id,
    updatedBy: req.user?._id || req.user?.id
    };
    const tip = await EnergyTip.create(payload);
    res.status(201).json({ success: true, message: 'Tip created', data: tip });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/admin/tips
 */
exports.listTips = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = buildAdminTipFilter(req.query);

    const [tips, total] = await Promise.all([
      EnergyTip.find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      EnergyTip.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: tips.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      },
      filters: {
        q: req.query.q || '',
        category: req.query.category || null,
        isActive: req.query.isActive ?? null
      },
      data: tips
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/v1/admin/tips/:tipId
 */
exports.updateTip = async (req, res) => {
  try {
    const { tipId } = req.params;
    const tip = await EnergyTip.findById(tipId);
    if (!tip) {
      return res.status(404).json({ success: false, message: 'Tip not found' });
    }

    Object.assign(tip, req.body);
    tip.updatedBy = req.user?._id || req.user?.id;
    await tip.save();
    res.status(200).json({ success: true, message: 'Tip updated', data: tip });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/v1/admin/tips/:tipId
 * Soft delete
 */
exports.deactivateTip = async (req, res) => {
  try {
    const { tipId } = req.params;
    const tip = await EnergyTip.findByIdAndUpdate(
      tipId,
      { isActive: false, updatedBy: req.user?._id || req.user?.id },
      { new: true, runValidators: true }
    );
    if (!tip) {
      return res.status(404).json({ success: false, message: 'Tip not found' });
    }
    res.status(200).json({ success: true, message: 'Tip deactivated', data: tip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
