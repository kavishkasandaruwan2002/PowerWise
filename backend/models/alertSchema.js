const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
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

    // Alert details
    type: {
      type: String,
      enum: ['budget_threshold', 'budget_exceeded', 'usage_spike', 'bill_prediction', 'anomaly', 'tariff_change'],
      required: [true, 'Alert type is required'],
      index: true,
      description: 'Type of alert'
    },

    title: {
      type: String,
      required: [true, 'Alert title is required'],
      description: 'Alert title/heading'
    },

    message: {
      type: String,
      required: [true, 'Alert message is required'],
      description: 'Detailed alert message'
    },

    // Severity level
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning',
      index: true,
      description: 'Alert severity level'
    },

    sourceModule: {
      type: String,
      enum: ['budget', 'consumption', 'prediction', 'spike_detection', 'tariff'],
      required: true,
      description: 'Which module generated this alert'
    },

    // Related data
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      description: 'ID of related entity (budget, consumption, prediction, etc)'
    },

    relatedData: {
      type: mongoose.Schema.Types.Mixed,
      description: 'Additional context data (thresholds, values, etc)'
    },

    // Alert status
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    readAt: {
      type: Date,
      description: 'When alert was marked as read'
    },

    isResolved: {
      type: Boolean,
      default: false,
      description: 'Has the issue causing alert been resolved?'
    },

    resolvedAt: {
      type: Date,
      description: 'When alert was resolved'
    },

    resolutionNotes: {
      type: String,
      trim: true,
      description: 'Notes on how issue was resolved'
    },

    // Display settings
    displayUntil: {
      type: Date,
      description: 'Auto-hide alert after this date'
    },

    isDismissed: {
      type: Boolean,
      default: false,
      description: 'User dismissed alert'
    },

    dismissedAt: {
      type: Date,
      description: 'When alert was dismissed'
    },

    // Metadata
    createdAt: {
      type: Date,
      default: () => new Date(),
      index: true
    },

    updatedAt: {
      type: Date,
      default: () => new Date()
    }
  },
  {
    timestamps: true,
    indexes: [
      { householdId: 1, isRead: 1, createdAt: -1 },
      { userId: 1, severity: 1, createdAt: -1 },
      { householdId: 1, type: 1, createdAt: -1 },
      { type: 1, severity: 1, isRead: 1 }
    ]
  }
);

alertSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};


alertSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

alertSchema.methods.dismiss = function() {
  this.isDismissed = true;
  this.dismissedAt = new Date();
  return this.save();
};

alertSchema.methods.markAsResolved = function(notes = '') {
  this.isResolved = true;
  this.resolvedAt = new Date();
  if (notes) this.resolutionNotes = notes;
  return this.save();
};

alertSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    type: this.type,
    title: this.title,
    message: this.message,
    severity: this.severity,
    isRead: this.isRead,
    isResolved: this.isResolved,
    isDismissed: this.isDismissed,
    createdAt: this.createdAt
  };
};

alertSchema.statics.getUnreadAlerts = function(userId) {
  return this.find({
    userId,
    isRead: false,
    isDismissed: false
  }).sort({ createdAt: -1 });
};

alertSchema.statics.getUnreadByHousehold = function(householdId) {
  return this.find({
    householdId,
    isRead: false,
    isDismissed: false
  }).sort({ severity: -1, createdAt: -1 });
};

alertSchema.statics.getCriticalAlerts = function(userId) {
  return this.find({
    userId,
    severity: 'critical',
    isResolved: false
  }).sort({ createdAt: -1 });
};

alertSchema.statics.getByType = function(userId, type) {
  return this.find({
    userId,
    type,
    isDismissed: false
  }).sort({ createdAt: -1 });
};

alertSchema.statics.getByHouseholdAndType = function(householdId, type) {
  return this.find({
    householdId,
    type,
    isDismissed: false
  }).sort({ createdAt: -1 });
};

alertSchema.statics.countUnread = function(userId) {
  return this.countDocuments({
    userId,
    isRead: false,
    isDismissed: false
  });
};

alertSchema.statics.getAlertsInRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Alert', alertSchema);