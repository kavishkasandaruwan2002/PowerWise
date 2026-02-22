const mongoose = require('mongoose');

const applianceSchema = new mongoose.Schema({
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Appliance name cannot exceed 100 characters']
  },
  category: {
    type: String,
    enum: ['Cooling', 'Lighting', 'Cooking', 'Standby', 'Entertainment', 'Other'],
    required: true
  },
  wattage: {
    type: Number,
    required: true,
    min: [1, 'Wattage must be at least 1W'],
    max: [10000, 'Wattage cannot exceed 10000W']
  },
  dailyUsageHours: {
    type: Number,
    required: true,
    min: [0, 'Usage hours cannot be negative'],
    max: [24, 'Usage hours cannot exceed 24']
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  efficiencyRating: {
    type: String,
    enum: ['Old', 'Standard', 'EnergySaving'],
    default: 'Standard'
  },
  purchaseYear: {
    type: Number,
    min: 1990,
    max: new Date().getFullYear()
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
applianceSchema.index({ createdBy: 1, category: 1 });
applianceSchema.index({ householdId: 1 });

// Virtual for daily consumption in kWh
applianceSchema.virtual('dailyConsumptionKWh').get(function () {
  return (this.wattage * this.dailyUsageHours) / 1000;
});

// Virtual for monthly consumption in kWh (30 days)
applianceSchema.virtual('monthlyConsumptionKWh').get(function () {
  return this.dailyConsumptionKWh * 30;
});

// Virtual for impact classification
applianceSchema.virtual('impactLevel').get(function () {
  return this.wattage > 500 ? 'High' : 'Low';
});

module.exports = mongoose.model('Appliance', applianceSchema);
