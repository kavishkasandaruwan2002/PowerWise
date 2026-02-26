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
      trim: true
    },

    // Consumption data
    consumption: {
      type: Number,
      required: [true, 'Consumption value is required'],
      min: [0, 'Consumption cannot be negative']
    },

    // Reading dates
    readingDate: {
      type: Date,
      required: true,
      default: () => new Date()
    },

    readingTime: {
      type: String,
      trim: true
    },

    // Period information
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },

    // Meter readings
    meterReading: {
      type: Number
    },

    previousMeterReading: {
      type: Number
    },

    // Data quality
    isEstimated: {
      type: Boolean,
      default: false
    },

    estimationReason: {
      type: String,
      trim: true
    },

    isManualEntry: {
      type: Boolean,
      default: false
    },

    // Analysis flags
    isAnomaly: {
      type: Boolean,
      default: false
    },

    anomalyReason: {
      type: String,
      trim: true
    },

    // Comparison with previous period
    comparisonWithPreviousDay: {
      type: Number
    },

    comparisonWithPreviousWeek: {
      type: Number
    },

    comparisonWithPreviousMonth: {
      type: Number
    },

    // Weather correlation (optional)
    weatherData: {
      temperature: Number,
      humidity: Number,
      weatherCondition: String
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
      default: 'recorded'
    },

    // Metadata
    sourceSystem: {
      type: String,
      enum: ['smartMeter', 'manualEntry', 'api', 'import'],
      default: 'manualEntry'
    },

    deviceId: {
      type: String
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
consumptionRecordSchema.methods.calculatePercentageChange = function (previousConsumption) {
  if (!previousConsumption || previousConsumption === 0) {
    return 0;
  }
  const change = ((this.consumption - previousConsumption) / previousConsumption) * 100;
  return Number(change.toFixed(2));
};

consumptionRecordSchema.methods.checkForAnomaly = function (dailyAverage, threshold = 50) {
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

consumptionRecordSchema.methods.getDaySummary = function () {
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
consumptionRecordSchema.statics.getConsumptionInRange = function (householdId, startDate, endDate) {
  return this.find({
    householdId,
    readingDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ readingDate: 1 });
};

consumptionRecordSchema.statics.getDailyConsumption = function (householdId, date) {
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

consumptionRecordSchema.statics.getLastNDays = function (householdId, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return this.find({
    householdId,
    readingDate: { $gte: startDate, $lte: endDate }
  }).sort({ readingDate: -1 });
};

consumptionRecordSchema.statics.getAnomalies = function (householdId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return this.find({
    householdId,
    isAnomaly: true,
    readingDate: { $gte: startDate }
  }).sort({ readingDate: -1 });
};

consumptionRecordSchema.statics.calculateAverageConsumption = function (householdId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        householdId: new mongoose.Types.ObjectId(householdId),
        readingDate: { $gte: startDate, $lte: endDate }
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

consumptionRecordSchema.statics.getTrend = function (householdId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return this.aggregate([
    {
      $match: {
        householdId: new mongoose.Types.ObjectId(householdId),
        readingDate: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$readingDate' } },
        dailyConsumption: { $sum: '$consumption' },
        avgConsumption: { $avg: '$consumption' },
        readingCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

consumptionRecordSchema.statics.getWeeklySummary = function (householdId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        householdId: new mongoose.Types.ObjectId(householdId),
        readingDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $week: '$readingDate' },
        weeklyConsumption: { $sum: '$consumption' },
        avgDaily: { $avg: '$consumption' },
        maxDaily: { $max: '$consumption' },
        minDaily: { $min: '$consumption' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

consumptionRecordSchema.statics.getMonthlySummary = function (householdId) {
  return this.aggregate([
    {
      $match: {
        householdId: new mongoose.Types.ObjectId(householdId)
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
    { $sort: { _id: -1 } }
  ]);
};

module.exports = mongoose.model('ConsumptionRecord', consumptionRecordSchema);