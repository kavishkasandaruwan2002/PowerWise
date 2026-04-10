const Household = require('../models/Household');

module.exports = async function householdOwnerCheck(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    const householdId = req.params.householdId || req.body.householdId || req.params.id;

    if (!householdId) {
      return res.status(400).json({ message: 'Household ID is required.' });
    }

    const household = await Household.findById(householdId);
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found.' });
    }

    if (household.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not the owner of this household.' });
    }

    next(); // user is owner, continue
  } catch (err) {
    console.error('householdOwnerCheck error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};