const mongoose = require('mongoose');

const tariffBlockSchema = new mongoose.Schema({
  minUsage: {
    type: Number,
    required: true,
    min: 0,
    description: 'Minimum kWh for this block'
  },
  maxUsage: {
    type: Number,
    required: true,
    min: 0,
    description: 'Maximum kWh for this block'
  },
  ratePerUnit: {
    type: Number,
    required: true,
    min: 0,
    description: 'Price per kWh in this block (LKR)'
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: false });

const tariffPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tariff name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    provider: {
      type: String,
      required: true,
      default: 'CEB',
      trim: true,
      maxlength: [50, 'Provider name cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    // Block tariff structure (domestic)
    blocks: {
      type: [tariffBlockSchema],
      required: [true, 'At least one tariff block is required'],
      validate: {
        validator: function(blocks) {
          return blocks.length > 0;
        },
        message: 'At least one tariff block is required'
      }
    },
    
    // Fixed charges
    fixedCharge: {
      type: Number,
      default: 0,
      min: [0, 'Fixed charge cannot be negative'],
      description: 'Monthly fixed service charge (LKR)'
    },
    fixedChargeDescription: {
      type: String,
      default: 'Monthly service charge',
      trim: true
    },
    
    // Additional charges
    additionalCharges: {
      otherCharges: [
        {
          name: {
            type: String,
            required: true,
            trim: true
          },
          amount: {
            type: Number,
            required: true,
            min: 0
          },
          description: String
        }
      ]
    },
    
    // Taxes and levies (percentage)
    taxes: {
      serviceChargeTax: {
        type: Number,
        default: 0,
        min: [0, 'Tax cannot be negative'],
        max: [100, 'Tax cannot exceed 100'],
        description: 'Tax on service charge (%)'
      },
      energyTax: {
        type: Number,
        default: 0,
        min: [0, 'Tax cannot be negative'],
        max: [100, 'Tax cannot exceed 100'],
        description: 'Tax on energy charges (%)'
      },
      VAT: {
        type: Number,
        default: 0,
        min: [0, 'VAT cannot be negative'],
        max: [100, 'VAT cannot exceed 100'],
        description: 'Value Added Tax (%)'
      }
    },
    
    // Effective date range
    effectiveFrom: {
      type: Date,
      required: true,
      default: () => new Date()
    },
    effectiveTo: {
      type: Date,
      default: null,
      description: 'Null if currently active'
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    
    // Metadata
    currency: {
      type: String,
      default: 'LKR'
    },
    
    version: {
      type: Number,
      default: 1,
      description: 'Track tariff version changes'
    },
    
    notes: {
      type: String,
      trim: true
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    indexes: [
      { name: 1 },
      { isActive: 1, effectiveFrom: -1 }
    ]
  }
);

// Instance Methods
tariffPlanSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return (
    this.isActive &&
    this.effectiveFrom <= now &&
    (!this.effectiveTo || this.effectiveTo > now)
  );
};

// Calculate bill for given consumption
tariffPlanSchema.methods.calculateBill = function(consumption) {
  let totalEnergy = 0;
  
  // Calculate block tariff
  for (const block of this.blocks) {
    if (consumption <= block.minUsage) break;
    
    const blockUsage = Math.min(consumption, block.maxUsage) - block.minUsage;
    totalEnergy += blockUsage * block.ratePerUnit;
  }
  
  // Add fixed charge
  let total = totalEnergy + this.fixedCharge;
  
  // Add additional charges
  let additionalChargesTotal = 0;
  if (this.additionalCharges?.otherCharges) {
    this.additionalCharges.otherCharges.forEach(charge => {
      additionalChargesTotal += charge.amount;
      total += charge.amount;
    });
  }
  
  // Calculate taxes
  const energyTax = (totalEnergy * this.taxes.energyTax) / 100;
  const fixedTax = (this.fixedCharge * this.taxes.serviceChargeTax) / 100;
  const subtotalBeforeVAT = total + energyTax + fixedTax;
  const vat = (subtotalBeforeVAT * this.taxes.VAT) / 100;
  
  const finalTotal = subtotalBeforeVAT + vat;
  
  return {
    energyCharge: Number(totalEnergy.toFixed(2)),
    fixedCharge: Number(this.fixedCharge.toFixed(2)),
    additionalCharges: Number(additionalChargesTotal.toFixed(2)),
    energyTax: Number(energyTax.toFixed(2)),
    fixedTax: Number(fixedTax.toFixed(2)),
    subtotal: Number(subtotalBeforeVAT.toFixed(2)),
    VAT: Number(vat.toFixed(2)),
    total: Number(finalTotal.toFixed(2)),
    breakdown: {
      consumption,
      blocks: this.blocks.map(block => ({
        range: `${block.minUsage} - ${block.maxUsage} kWh`,
        rate: `Rs. ${block.ratePerUnit}/kWh`,
        description: block.description
      }))
    }
  };
};

// Static Methods
tariffPlanSchema.statics.getActiveTariff = function() {
  return this.findOne({
    isActive: true,
    effectiveFrom: { $lte: new Date() },
    $or: [
      { effectiveTo: null },
      { effectiveTo: { $gt: new Date() } }
    ]
  }).sort({ effectiveFrom: -1 });
};

tariffPlanSchema.statics.getAllActive = function() {
  return this.find({
    isActive: true,
    effectiveFrom: { $lte: new Date() },
    $or: [
      { effectiveTo: null },
      { effectiveTo: { $gt: new Date() } }
    ]
  }).sort({ effectiveFrom: -1 });
};

module.exports = mongoose.model('TariffPlan', tariffPlanSchema);