const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
    {
        month: { type: Number, required: true, min: 1, max: 12 },
        year:  { type: Number, required: true },
        targetAmount: {
            type: Number,
            required: [true, 'Target budget amount is required'],
            min: [0, 'Budget cannot be negative'],
        },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

const HouseholdSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Household name is required'],
            trim: true,
        },

        // Owner / primary account holder
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Smart Feature: Multiple users under one household
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

        householdSize: {
            type: Number,
            required: [true, 'Household size is required'],
            min: [1, 'At least 1 member required'],
        },

        // Smart Feature: Household type classification
        householdType: {
            type: String,
            enum: ['apartment', 'boarding_house', 'rural_home', 'house'],
            default: 'house',
        },

        // Location for weather API integration (used in Component 3)
        location: {
            city:      { type: String, trim: true },
            district:  { type: String, trim: true },
            province:  { type: String, trim: true },
            latitude:  { type: Number },
            longitude: { type: Number },
        },

        incomeBracket: {
            type: String,
            enum: ['low', 'middle', 'high'],
            required: true,
        },

        // Smart Feature: Electricity tariff selection
        tariffType: {
            type: String,
            enum: ['domestic', 'religious', 'small_business'],
            default: 'domestic',
        },

        budgets: [BudgetSchema],

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Virtual: current month's budget
HouseholdSchema.virtual('currentBudget').get(function () {
    const now = new Date();
    return (
        this.budgets.find(
            (b) => b.month === now.getMonth() + 1 && b.year === now.getFullYear()
        ) || null
    );
});

HouseholdSchema.set('toJSON', { virtuals: true });
HouseholdSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Household', HouseholdSchema);