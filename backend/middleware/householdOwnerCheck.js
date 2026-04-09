const budgetController = require('../controllers/budgetController');

module.exports = async function householdOwnerCheck(req, res, next) {
  try {
    const userId = req.user?.id;
    const householdId = req.params.householdId || req.body.householdId;

    if (!householdId) {
      return res.status(400).json({ message: 'Household ID is required.' });
    }

    const isOwner = await budgetController.isUserHouseholdOwner(userId, householdId);

    if (!isOwner) {
      return res.status(403).json({ message: 'You are not the owner of this household.' });
    }

    next(); // user is owner, continue
  } catch (err) {
    console.error('householdOwnerCheck error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};