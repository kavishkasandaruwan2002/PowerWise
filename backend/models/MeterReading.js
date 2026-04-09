const mongoose = require('mongoose');

const meterReadingSchema = new mongoose.Schema({
    householdId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Household',
        required: true
    },
    readingValue: {
        type: Number,
        required: [true, 'Reading value is required'],
        min: [0, 'Reading value cannot be negative']
    },
    readingType: {
        type: String,
        enum: ['Monthly', 'Weekly', 'Custom', 'Actual'],
        default: 'Monthly'
    },
    readingDate: {
        type: Date,
        required: [true, 'Reading date is required'],
        default: Date.now
    },
    previousReading: {
        type: Number,
        min: 0
    },
    consumption: {
        type: Number
    },
    estimatedConsumption: {
        type: Number,
        min: 0
    },
    accuracy: {
        type: Number,
        min: 0,
        max: 100
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Index for efficient query of readings by user and date
meterReadingSchema.index({ submittedBy: 1, readingDate: -1 });
meterReadingSchema.index({ householdId: 1, readingDate: -1 });

// Pre-save hook: auto-calculate consumption if previous reading exists
meterReadingSchema.pre('save', async function () {
    if (this.isNew) {
        try {
            // Find the most recent reading before this one's date
            const lastReading = await this.constructor.findOne({
                householdId: this.householdId,
                readingDate: { $lte: this.readingDate },
                _id: { $ne: this._id } // Exclude current if it somehow exists
            }).sort({ readingDate: -1, createdAt: -1 });

            if (lastReading) {
                this.previousReading = lastReading.readingValue;
                this.consumption = Math.max(0, this.readingValue - lastReading.readingValue);
            } else {
                this.previousReading = 0;
                this.consumption = this.readingValue;
            }
        } catch (err) {
            console.error('Error in MeterReading pre-save hook:', err);
            // We don't throw here to allow the save to proceed even if calculation fails
        }
    }
});

module.exports = mongoose.model('MeterReading', meterReadingSchema);
