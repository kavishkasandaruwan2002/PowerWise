const mongoose = require('mongoose');

const consumptionRecordSchema = new mongoose.Schema(
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

    // Meter reference
    meterId: {
      type: String,
      trim: true,
      description: 'Smart meter ID (if available)'
    },

    // Consumption data
    consumption: {
      type: Number,
      required: [true, 'Consumption value is required'],
      min: [0, 'Consumption cannot be negative'],
      description: 'Consumption in kWh'
    },

    // Reading dates
    readingDate: {
      type: Date,
      required: true,
      default: () => new Date(),
      description: 'Date of consumption reading'
    },

    readingTime: {
      type: String,
      trim: true,
      description: 'Time of reading (HH:MM format, optional)'
    },

    // Period information
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
      description: 'Period type of the reading'
    },

    // Meter readings
    meterReading: {
      type: Number,
      description: 'Actual meter reading (cumulative kWh)'
    },

    previousMeterReading: {
      type: Number,
      description: 'Previous meter reading (for calculating consumption)'
    },

    // Data quality
    isEstimated: {
      type: Boolean,
      default: false,
      description: 'Was this reading estimated?'
    },

    estimationReason: {
      type: String,
      trim: true,
      description: 'Why was reading estimated'
    },

    isManualEntry: {
      type: Boolean,
      default: false,
      description: 'Was this manually entered or from smart meter?'
    },

    // Analysis flags
    isAnomaly: {
      type: Boolean,
      default: false,
      description: 'Detected as usage anomaly?'
    },

    anomalyReason: {
      type: String,
      trim: true,
      description: 'Reason for anomaly flag'
    },

    // Comparison with previous period
    comparisonWithPreviousDay: {
      type: Number,
      description: 'Percentage change from previous day'
    },

    comparisonWithPreviousWeek: {
      type: Number,
      description: 'Percentage change from same day last week'
    },

    comparisonWithPreviousMonth: {
      type: Number,
      description: 'Percentage change from same date last month'
    },

    // Weather correlation (optional)
    weatherData: {
      temperature: Number,
      humidity: Number,
      weatherCondition: String,
      description: 'Weather data for correlation analysis'
    },

    // Notes
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },

    // Status
    status: {
      type: String,
      enum: ['recorded', 'verified', 'flagged', 'corrected'],
      default: 'recorded',
      description: 'Status of the reading'
    },

    // Metadata
    sourceSystem: {
      type: String,
      enum: ['smartMeter', 'manualEntry', 'api', 'import'],
      default: 'manualEntry',
      description: 'Source of the consumption data'
    },

    deviceId: {
      type: String,
      description: 'Device ID that recorded the data'
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'User who created this record'
    }
  },
  {
    timestamps: true,
    indexes: [
      { householdId: 1, readingDate: -1 },
      { userId: 1, readingDate: -1 },
      { householdId: 1, period: 1, readingDate: -1 },
      { isAnomaly: 1, readingDate: -1 },
      { readingDate: -1 }
    ]
  }
);

// Instance Methods

/**
 * Calculate consumption percentage change
 */
consumptionRecordSchema.methods.calculatePercentageChange = function(previousConsumption) {
  if (!previousConsumption || previousConsumption === 0) {
    return 0;
  }
  const change = ((this.consumption - previousConsumption) / previousConsumption) * 100;
  return Number(change.toFixed(2));
};

/**
 * Check if consumption is anomalous (compared to daily average)
 */
consumptionRecordSchema.methods.checkForAnomaly = function(dailyAverage, threshold = 50) {
  if (!dailyAverage || dailyAverage === 0) {
    return false;
  }
  
  const percentageChange = this.calculatePercentageChange(dailyAverage);
  const isAnomaly = Math.abs(percentageChange) > threshold;
  
  if (isAnomaly) {
    this.isAnomaly = true;
    this.anomalyReason = `${percentageChange > 0 ? 'High' : 'Low'} consumption spike: ${Math.abs(percentageChange)}% change from daily average`;
  }
  
  return isAnomaly;
};

/**
 * Get consumption summary for the day
 */
consumptionRecordSchema.methods.getDaySummary = function() {
  return {
    date: this.readingDate,
    consumption: this.consumption,
    period: this.period,
    isAnomaly: this.isAnomaly,
    status: this.status,
    sourceSystem: this.sourceSystem
  };
};

// Static Methods

/**
 * Get consumption records for a household in date range
 */
consumptionRecordSchema.statics.getConsumptionInRange = function(householdId, startDate, endDate) {
  return this.find({
    householdId,
    readingDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ readingDate: 1 });
};

/**
 * Get daily consumption for a specific date
 */
consumptionRecordSchema.statics.getDailyConsumption = function(householdId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.findOne({
    householdId,
    readingDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
};

/**
 * Get last N days consumption
 */
consumptionRecordSchema.statics.getLastNDays = function(householdId, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    householdId,
    readingDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ readingDate: -1 });
};

/**
 * Get anomalies for household
 */
consumptionRecordSchema.statics.getAnomalies = function(householdId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    householdId,
    isAnomaly: true,
    readingDate: {
      $gte: startDate
    }
  }).sort({ readingDate: -1 });
};

/**
 * Calculate average consumption for period
 */
consumptionRecordSchema.statics.calculateAverageConsumption = function(householdId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        householdId: mongoose.Types.ObjectId(householdId),
        readingDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        averageConsumption: { $avg: '$consumption' },
        totalConsumption: { $sum: '$consumption' },
        maxConsumption: { $max: '$consumption' },
        minConsumption: { $min: '$consumption' },
        count: { $sum: 1 }
      }
    }
  ]);
};

/**
 * Get consumption trend
 */
consumptionRecordSchema.statics.getTrend = function(householdId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        householdId: mongoose.Types.ObjectId(householdId),
        readingDate: {
          $gte: startDate
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$readingDate' }
        },
        dailyConsumption: { $sum: '$consumption' },
        avgConsumption: { $avg: '$consumption' },
        readingCount: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

/**
 * Get weekly summary
 */
consumptionRecordSchema.statics.getWeeklySummary = function(householdId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        householdId: mongoose.Types.ObjectId(householdId),
        readingDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          $week: '$readingDate'
        },
        weeklyConsumption: { $sum: '$consumption' },
        avgDaily: { $avg: '$consumption' },
        maxDaily: { $max: '$consumption' },
        minDaily: { $min: '$consumption' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

/**
 * Get monthly summary
 */
consumptionRecordSchema.statics.getMonthlySummary = function(householdId) {
  return this.aggregate([
    {
      $match: {
        householdId: mongoose.Types.ObjectId(householdId)
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$readingDate' },
          month: { $month: '$readingDate' }
        },
        monthlyConsumption: { $sum: '$consumption' },
        avgDaily: { $avg: '$consumption' },
        maxDaily: { $max: '$consumption' },
        minDaily: { $min: '$consumption' },
        daysWithData: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
};

module.exports = mongoose.model('ConsumptionRecord', consumptionRecordSchema);