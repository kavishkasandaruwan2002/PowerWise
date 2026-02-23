const EnergyTip = require('../models/EnergyTip');

/**
 * POST /api/v1/admin/tips
 */
exports.createTip = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user?.id,
      updatedBy: req.user?.id
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
    const { isActive, q, category } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };

    const tips = await EnergyTip.find(filter).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: tips.length, data: tips });
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
    tip.updatedBy = req.user?.id;
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
      { isActive: false, updatedBy: req.user?.id },
      { new: true }
    );
    if (!tip) {
      return res.status(404).json({ success: false, message: 'Tip not found' });
    }
    res.status(200).json({ success: true, message: 'Tip deactivated', data: tip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
