import mongoose from 'mongoose';

const householdSchema = new mongoose.Schema({
    address: {
        type: String,
        trim: true,
    },
    size: {
        type: Number,
        min: 1,
    },
    incomeLevel: {
        type: String,
        enum: ['low', 'middle', 'high'],
    },
    type: {
        type: String,
        enum: ['apartment', 'boarding', 'rural', 'other'],
        default: 'other',
    },
    tariffType: {
        type: String,
        enum: ['domestic', 'religious', 'small_business'],
        default: 'domestic',
    },
    monthlyBudget: {
        type: Number,
        min: 0,
        default: 0,
    },
}, {
    timestamps: true,
});

export default mongoose.model('Household', householdSchema);