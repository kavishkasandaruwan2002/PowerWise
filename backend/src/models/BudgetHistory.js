import mongoose from 'mongoose';

const budgetHistorySchema = new mongoose.Schema({
    householdId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Household',
        required: true,
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
    },
    year: {
        type: Number,
        required: true,
    },
    budgetAmount: {
        type: Number,
        required: true,
        min: 0,
    },
}, {
    timestamps: true,
});

// Ensure one entry per household per month
budgetHistorySchema.index({ householdId: 1, month: 1, year: 1 }, { unique: true });

const BudgetHistory = mongoose.model('BudgetHistory', budgetHistorySchema);
export default BudgetHistory;