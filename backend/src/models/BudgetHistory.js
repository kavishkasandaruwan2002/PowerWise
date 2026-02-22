import mongoose from 'mongoose';

const budgetHistorySchema = new mongoose.Schema({
    householdId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Household',
        required: [true, 'Household ID is required'],
        index: true // Add index for faster queries
    },
    month: {
        type: Number,
        required: [true, 'Month is required'],
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    },
    budgetAmount: {
        type: Number,
        required: [true, 'Budget amount is required'],
        min: [0, 'Budget cannot be negative']
    },
    // Additional useful fields
    previousBudget: {
        type: Number,
        default: null
    },
    changeAmount: {
        type: Number,
        default: 0
    },
    changePercentage: {
        type: Number,
        default: 0
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        enum: ['manual_update', 'monthly_reset', 'admin_adjustment', 'system'],
        default: 'manual_update'
    },
    notes: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Compound index to ensure one entry per household per month/year
budgetHistorySchema.index({ householdId: 1, month: 1, year: 1 }, { unique: true });

// Pre-save middleware to calculate change
budgetHistorySchema.pre('save', async function(next) {
    try {
        // Find the previous budget entry for this household
        const previousEntry = await this.constructor.findOne({
            householdId: this.householdId,
            $or: [
                { year: this.year, month: { $lt: this.month } },
                { year: { $lt: this.year } }
            ]
        }).sort({ year: -1, month: -1 });

        if (previousEntry) {
            this.previousBudget = previousEntry.budgetAmount;
            this.changeAmount = this.budgetAmount - previousEntry.budgetAmount;
            this.changePercentage = previousEntry.budgetAmount > 0
                ? (this.changeAmount / previousEntry.budgetAmount * 100).toFixed(2)
                : 0;
        }
        next();
    } catch (error) {
        next(error);
    }
});

const BudgetHistory = mongoose.model('BudgetHistory', budgetHistorySchema);
export default BudgetHistory;