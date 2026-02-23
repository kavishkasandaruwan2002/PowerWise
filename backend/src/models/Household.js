import mongoose from 'mongoose';

const householdSchema = new mongoose.Schema({
    address: {
        type: String,
        trim: true,
        default: '',
        maxlength: [200, 'Address cannot exceed 200 characters']
    },
    city: {
        type: String,
        trim: true,
        default: ''
    },
    postalCode: {
        type: String,
        trim: true,
        default: ''
    },
    size: {
        type: Number,
        min: [1, 'Household size must be at least 1'],
        default: 1,
    },
    incomeLevel: {
        type: String,
        enum: {
            values: ['low', 'middle', 'high'],
            message: 'Income level must be low, middle, or high'
        },
        default: 'middle',
    },
    type: {
        type: String,
        enum: {
            values: ['apartment', 'boarding', 'rural', 'other'],
            message: 'Property type must be apartment, boarding, rural, or other'
        },
        default: 'other',
    },
    tariffType: {
        type: String,
        enum: {
            values: ['domestic', 'religious', 'small_business'],
            message: 'Tariff type must be domestic, religious, or small_business'
        },
        default: 'domestic',
    },
    monthlyBudget: {
        type: Number,
        min: [0, 'Monthly budget cannot be negative'],
        default: 0,
    },
    // QR Code fields
    qrToken: {
        type: String,
        unique: true,
        sparse: true
    },
    qrGeneratedAt: {
        type: Date
    },
    monthlyBill: {
        type: Number,
        default: 0
    },
    billDueDate: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for member count
householdSchema.virtual('memberCount', {
    ref: 'User',
    localField: '_id',
    foreignField: 'householdId',
    count: true
});

const Household = mongoose.model('Household', householdSchema);
export default Household;