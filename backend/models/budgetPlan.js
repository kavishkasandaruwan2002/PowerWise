const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['threshold', 'spike', 'prediction', 'manual'],
    required: true,
    description: 'Type of alert'
  },
  message: {
    type: String,
    required: true,
    description: 'Alert message'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    description: 'Alert severity level'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  triggeredAt: {
    type: Date,
    default: () => new Date()
  }
}, { _id: false });

const budgetPlanSchema = new mongoose.Schema(
  {
    // User & Household
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: [true, 'Household ID is required'],
      index: true
    },
    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    
    // Tariff reference
    tariffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TariffPlan',
      description: 'Active tariff when budget was created'
    },
    
    // Budget limits
    monthlyLimit: {
      type: Number,
      required: [true, 'Monthly budget limit is required'],
      min: [0, 'Budget limit cannot be negative'],
      description: 'Monthly budget in LKR'
    },
    
    // Alert thresholds
    alertThresholds: {
      consumption: {
        type: Number,
        default: null,
        description: 'Alert when consumption reaches X kWh'
      },
      billAmount: {
        type: Number,
        default: null,
        description: 'Alert when bill reaches Rs. X'
      },
      percentageOfBudget: {
        type: Number,
        default: 80,
        min: [0, 'Percentage cannot be negative'],
        max: [100, 'Percentage cannot exceed 100'],
        description: 'Alert at X% of budget (e.g., 80)'
      }
    },
    
    // Period
    startDate: {
      type: Date,
      required: true,
      default: () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
      },
      description: 'Budget period start date (usually 1st of month)'
    },
    
    endDate: {
      type: Date,
      description: 'Budget period end date (usually last day of month)'
    },
    
    // Consumption tracking
    actualConsumption: {
      type: Number,
      default: 0,
      min: [0, 'Consumption cannot be negative'],
      description: 'Actual consumption in kWh so far'
    },
    
    projectedConsumption: {
      type: Number,
      default: 0,
      description: 'Projected consumption for full month'
    },
    
    // Bill tracking
    currentBill: {
      type: Number,
      default: 0,
      min: [0, 'Bill cannot be negative'],
      description: 'Current bill amount in LKR'
    },
    
    projectedBill: {
      type: Number,
      default: 0,
      description: 'Projected bill at end of month'
    },
    
    // Status
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'exceeded'],
      default: 'active',
      index: true,
      description: 'Current status of budget'
    },
    
    // Alert history
    alerts: {
      type: [alertSchema],
      default: [],
      description: 'Array of triggered alerts'
    },
    
    // Notes
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    
    // Metadata
    isActive: {
      type: Boolean,
      default: true,
      index: true
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
      { householdId: 1, status: 1 },
      { userId: 1, startDate: -1 },
      { isActive: 1, status: 1 }
    ]
  }
);

// Instance Methods

/**
 * Check if budget period is active
 */
budgetPlanSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  
  // Set end date if not set (last day of month)
  if (!this.endDate) {
    const nextMonth = new Date(this.startDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.endDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0);
  }
  
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
};

/**
 * Get remaining budget amount
 */
budgetPlanSchema.methods.getRemainingBudget = function() {
  const remaining = this.monthlyLimit - this.currentBill;
  return Number(Math.max(0, remaining).toFixed(2));
};

/**
 * Get budget usage percentage
 */
budgetPlanSchema.methods.getBudgetPercentage = function() {
  if (this.monthlyLimit === 0) return 0;
  const percentage = (this.currentBill / this.monthlyLimit) * 100;
  return Number(Math.min(100, percentage).toFixed(2));
};

/**
 * Check if budget is exceeded
 */
budgetPlanSchema.methods.isExceeded = function() {
  return this.currentBill > this.monthlyLimit;
};

/**
 * Check if alert threshold is crossed
 */
budgetPlanSchema.methods.shouldTriggerAlert = function() {
  const percentageUsed = this.getBudgetPercentage();
  const thresholdPercentage = this.alertThresholds.percentageOfBudget || 80;
  
  return percentageUsed >= thresholdPercentage;
};

/**
 * Add alert
 */
budgetPlanSchema.methods.addAlert = function(type, message, severity = 'medium') {
  const alert = {
    type,
    message,
    severity,
    triggeredAt: new Date()
  };
  
  this.alerts.push(alert);
  
  // Keep only last 50 alerts
  if (this.alerts.length > 50) {
    this.alerts = this.alerts.slice(-50);
  }
  
  return alert;
};

/**
 * Get unread alerts count
 */
budgetPlanSchema.methods.getUnreadAlertsCount = function() {
  return this.alerts.filter(alert => !alert.isRead).length;
};

/**
 * Mark alert as read
 */
budgetPlanSchema.methods.markAlertAsRead = function(alertIndex) {
  if (this.alerts[alertIndex]) {
    this.alerts[alertIndex].isRead = true;
    return true;
  }
  return false;
};

/**
 * Get budget summary
 */
budgetPlanSchema.methods.getSummary = function() {
  return {
    monthlyLimit: this.monthlyLimit,
    currentBill: this.currentBill,
    projectedBill: this.projectedBill,
    remaining: this.getRemainingBudget(),
    percentageUsed: this.getBudgetPercentage(),
    isExceeded: this.isExceeded(),
    actualConsumption: this.actualConsumption,
    projectedConsumption: this.projectedConsumption,
    status: this.status,
    startDate: this.startDate,
    endDate: this.endDate,
    unreadAlerts: this.getUnreadAlertsCount()
  };
};

/**
 * Update consumption and calculate bill
 */
budgetPlanSchema.methods.updateConsumption = function(consumption, tariff) {
  this.actualConsumption = consumption;
  
  if (tariff) {
    const billData = tariff.calculateBill(consumption);
    this.currentBill = billData.total;
  }
  
  // Update status
  if (this.isExceeded()) {
    this.status = 'exceeded';
  } else if (this.status === 'exceeded') {
    this.status = 'active';
  }
  
  return this;
};

/**
 * Calculate projected consumption (based on days elapsed)
 */
budgetPlanSchema.methods.calculateProjectedConsumption = function() {
  const now = new Date();
  const startOfMonth = this.startDate;
  
  // Calculate days elapsed
  const daysElapsed = Math.ceil(
    (now - startOfMonth) / (1000 * 60 * 60 * 24)
  );
  
  const daysInMonth = new Date(
    startOfMonth.getFullYear(),
    startOfMonth.getMonth() + 1,
    0
  ).getDate();
  
  if (daysElapsed === 0) {
    this.projectedConsumption = this.actualConsumption;
  } else {
    this.projectedConsumption = Number(
      (this.actualConsumption * daysInMonth / daysElapsed).toFixed(2)
    );
  }
  
  return this.projectedConsumption;
};

/**
 * Calculate projected bill (based on days elapsed)
 */
budgetPlanSchema.methods.calculateProjectedBill = function(tariff) {
  if (!tariff) return this.projectedBill;
  
  this.calculateProjectedConsumption();
  
  const billData = tariff.calculateBill(this.projectedConsumption);
  this.projectedBill = billData.total;
  
  return this.projectedBill;
};

/**
 * Get days remaining in budget period
 */
budgetPlanSchema.methods.getDaysRemaining = function() {
  const now = new Date();
  if (!this.endDate) return 0;
  
  const daysRemaining = Math.ceil(
    (this.endDate - now) / (1000 * 60 * 60 * 24)
  );
  
  return Math.max(0, daysRemaining);
};

// Static Methods

/**
 * Get active budget for household
 */
budgetPlanSchema.statics.getActiveBudget = function(householdId) {
  const now = new Date();
  
  return this.findOne({
    householdId,
    status: 'active',
    startDate: { $lte: now },
    isActive: true
  }).sort({ startDate: -1 });
};

/**
 * Get current month budget
 */
budgetPlanSchema.statics.getCurrentMonthBudget = function(householdId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return this.findOne({
    householdId,
    startDate: { $gte: startOfMonth, $lte: endOfMonth },
    isActive: true
  });
};

/**
 * Get all budgets for household in date range
 */
budgetPlanSchema.statics.getBudgetsInRange = function(householdId, startDate, endDate) {
  return this.find({
    householdId,
    startDate: { $gte: startDate, $lte: endDate },
    isActive: true
  }).sort({ startDate: -1 });
};

module.exports = mongoose.model('budgetPlan', budgetPlanSchema);