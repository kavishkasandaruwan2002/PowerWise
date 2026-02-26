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
        enum: ['Monthly', 'Weekly', 'Custom'],
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
        type: Number,
        min: 0
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
meterReadingSchema.pre('save', function (next) {
    if (this.isNew) {
        // Use this.constructor to access the model without circular dependency issues
        this.constructor.findOne({
            householdId: this.householdId,
            readingDate: { $lt: this.readingDate }
        })
            .sort({ readingDate: -1 })
            .then(lastReading => {
                if (lastReading) {
                    this.previousReading = lastReading.readingValue;
                    this.consumption = this.readingValue - lastReading.readingValue;
                }
                next();
            })
            .catch(err => {
                // Ignore errors in pre-save, proceed with save
                next();
            });
    } else {
        next();
    }
});

module.exports = mongoose.model('MeterReading', meterReadingSchema);
