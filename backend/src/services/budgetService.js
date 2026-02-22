import BudgetHistory from '../models/BudgetHistory.js';
import Household from '../models/Household.js';
import AppError from '../utils/AppError.js';

export const updateBudget = async (householdId, newBudget, month, year) => {
    const household = await Household.findByIdAndUpdate(
        householdId,
        { monthlyBudget: newBudget },
        { new: true, runValidators: true }
    );
    if (!household) throw new AppError('Household not found', 404);

    await BudgetHistory.findOneAndUpdate(
        { householdId, month, year },
        { budgetAmount: newBudget },
        { upsert: true, new: true }
    );

    return household;
};

export const getBudgetHistory = async (householdId) => {
    return await BudgetHistory.find({ householdId }).sort({ year: -1, month: -1 });
};