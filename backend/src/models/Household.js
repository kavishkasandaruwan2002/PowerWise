import mongoose from 'mongoose';

const householdSchema = new mongoose.Schema({
    address: {
        type: String,
        trim: true,
        default: '',
    },
    size: {
        type: Number,
        min: 1,
        default: 1,
    },
    incomeLevel: {
        type: String,
        enum: ['low', 'middle', 'high'],
        default: 'middle',
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

const Household = mongoose.model('Household', householdSchema);
export default Household;