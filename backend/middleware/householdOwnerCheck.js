const Household = require('../models/Household');
const Budget = require('../models/budgetPlan');

module.exports = async function householdOwnerCheck(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    let householdId;

    // ✅ 1. If explicitly provided (POST / PUT)
    if (req.body?.householdId) {
      householdId = req.body.householdId;
    }

    // ✅ 2. If route has householdId param
    else if (req.params.householdId) {
      householdId = req.params.householdId;
    }

    // ✅ 3. If only budgetId exists (DELETE / PUT)
    else if (req.params.id) {
      const budget = await Budget.findById(req.params.id);

      if (!budget) {
        return res.status(404).json({ message: 'Budget not found.' });
      }

      householdId = budget.householdId;
    }

    // ❌ No householdId found
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

    next();

  } catch (err) {
    console.error('householdOwnerCheck error:', err);
    res.status(500).json({ message: err.message });
  }
};