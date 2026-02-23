const mongoose = require('mongoose');

const tipInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: true
    },
    tipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnergyTip',
      required: true
    },
    bookmarked: {
      type: Boolean,
      default: false
    },
    implemented: {
      type: Boolean,
      default: false
    },
    implementedAt: {
      type: Date
    },
    feedback: {
      rating: {
        type: String,
        enum: ['HELPFUL', 'NOT_HELPFUL', 'NEUTRAL']
      },
      comment: {
        type: String,
        trim: true,
        maxlength: 500
      },
      updatedAt: {
        type: Date
      }
    },
    dismissedUntil: {
      type: Date
    },
    // Snapshot taken at the time user marks implemented.
    // This prevents estimates changing later when tariffs or appliances change.
    savingsSnapshot: {
      kwhMonthly: Number,
      lkrMonthly: Number,
      baselineKwhMonthly: Number,
      baselineBillLkr: Number,
      newBillLkr: Number,
      tariffPlanId: String
    }
  },
  {
    timestamps: true
  }
);

tipInteractionSchema.index({ userId: 1, tipId: 1 }, { unique: true });
tipInteractionSchema.index({ householdId: 1, implemented: 1 });

module.exports = mongoose.model('TipInteraction', tipInteractionSchema);
