const mongoose = require('mongoose');

const SAVINGS_MODEL_TYPES = [
  'PERCENT_OF_CATEGORY',
  'FIXED_KWH',
  'REDUCE_HOURS',
  'STANDBY_OFF'
];

const energyTipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200
    },
    category: {
      type: String,
      enum: ['Cooling', 'Lighting', 'Cooking', 'Standby', 'Entertainment', 'Other', 'General'],
      default: 'General'
    },
    // Example: ["ac", "air conditioner"] or ["bulb", "light"]
    requiredApplianceKeywords: {
      type: [String],
      default: []
    },
    requiredCategories: {
      type: [String],
      enum: ['Cooling', 'Lighting', 'Cooking', 'Standby', 'Entertainment', 'Other', 'General'],
      default: []
    },
    incomeTags: {
      type: [String],
      enum: ['LOW', 'MID', 'HIGH', 'ALL'],
      default: ['ALL']
    },
    weatherTags: {
      type: [String],
      enum: ['HOT', 'RAINY', 'NORMAL', 'ALL'],
      default: ['ALL']
    },
    timeTags: {
      type: [String],
      enum: ['DAY', 'NIGHT', 'PEAK', 'ALL'],
      default: ['ALL']
    },
    effortLevel: {
      type: String,
      enum: ['ZERO_COST', 'LOW_COST', 'INVESTMENT'],
      default: 'ZERO_COST'
    },
    // Savings model is intentionally simple and explainable.
    // Avoid fake precision: use ranges in presentation layer.
    savingsModel: {
      type: {
        type: String,
        enum: SAVINGS_MODEL_TYPES,
        default: 'PERCENT_OF_CATEGORY'
      },
      // Used for PERCENT_OF_CATEGORY: e.g., 5 means 5%
      percent: {
        type: Number,
        min: 0,
        max: 100
      },
      // Used for FIXED_KWH: monthly fixed saving
      fixedKWhMonthly: {
        type: Number,
        min: 0
      },
      // Used for REDUCE_HOURS: reduce X hours per day on matched appliances
      reduceHoursPerDay: {
        type: Number,
        min: 0,
        max: 24
      },
      // If set, we try to match appliance name with this keyword for REDUCE_HOURS/STANDBY_OFF
      applianceKeyword: {
        type: String,
        trim: true
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

energyTipSchema.index({ isActive: 1, category: 1 });
energyTipSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('EnergyTip', energyTipSchema);
