const mongoose = require('mongoose');

const billPredictionSchema = new mongoose.Schema(
  {
    // References
    householdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Household',
      required: [true, 'Household ID is required'],
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },

    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BudgetPlan',
      description: 'Associated budget for this prediction'
    },

    tariffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TariffPlan',
      required: [true, 'Tariff ID is required']
    },

    // Prediction period
    predictionDate: {
      type: Date,
      default: () => new Date(),
      description: 'When prediction was made'
    },

    predictionPeriod: {
      startDate: {
        type: Date,
        required: true,
        description: 'Period start (usually 1st of month)'
      },
      endDate: {
        type: Date,
        required: true,
        description: 'Period end (usually last day of month)'
      }
    },

    // Analysis data
    analysisData: {
      currentDate: {
        type: Date,
        description: 'Current date when prediction was made'
      },
      daysElapsed: {
        type: Number,
        description: 'Days elapsed in period'
      },
      daysRemaining: {
        type: Number,
        description: 'Days remaining in period'
      },
      totalDaysInPeriod: {
        type: Number,
        description: 'Total days in period'
      },
      currentConsumption: {
        type: Number,
        description: 'Consumption so far'
      },
      currentBill: {
        type: Number,
        description: 'Bill so far'
      }
    },

    // Historical data used for prediction
    historicalData: {
      previousMonthConsumption: Number,
      previousMonthBill: Number,
      averageDailyConsumption: Number,
      averageDailyBill: Number,
      trend: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable'],
        description: 'Consumption trend'
      },
      trendPercentage: {
        type: Number,
        description: 'Trend as percentage'
      },
      dataPoints: {
        type: Number,
        description: 'Number of historical data points used'
      }
    },

    // Predictions
    predictions: {
      consumptionPrediction: {
        value: Number,
        confidence: Number,  // 0-100
        method: String,      // linear, average, trend-based
        description: String
      },

      billPrediction: {
        value: Number,
        confidence: Number,  // 0-100
        breakdown: {
          energyCharge: Number,
          fixedCharge: Number,
          additionalCharges: Number,
          taxes: Number,
          VAT: Number
        },
        method: String,
        description: String
      },

      scenarios: [
        {
          name: String,           // 'Conservative', 'Aggressive', 'Optimistic'
          consumptionAdjustment: Number,  // %, e.g., -10%, +10%
          predictedConsumption: Number,
          predictedBill: Number
        }
      ]
    },

    // Budget comparison
    budgetComparison: {
      monthlyBudget: Number,
      predictedBill: Number,
      difference: Number,       // Budget - Predicted
      percentageOfBudget: Number,  // 0-100+
      willExceed: Boolean,
      warningLevel: {
        type: String,
        enum: ['green', 'yellow', 'red'],  // Green: <80%, Yellow: 80-100%, Red: >100%
      }
    },

    // Recommendations
    recommendations: [
      {
        type: String,
        description: 'Based on prediction vs budget'
      }
    ],

    // Confidence & reliability
    reliability: {
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
        description: 'How reliable is this prediction'
      },
      factors: {
        dataCompleteness: Number,    // Do we have full month data?
        consistencyScore: Number,    // How consistent is consumption?
        seasonalAdjustment: Number,  // Seasonal factor
        anomalyCount: Number         // How many anomalies in data?
      },
      notes: String
    },

    // Status
    status: {
      type: String,
      enum: ['provisional', 'confirmed', 'outdated'],
      default: 'provisional',
      description: 'Prediction status'
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    indexes: [
      { householdId: 1, 'predictionPeriod.startDate': -1 },
      { userId: 1, createdAt: -1 },
      { 'budgetComparison.willExceed': 1 }
    ]
  }
);

// Instance Methods

/**
 * Check if prediction is still valid (made today)
 */
billPredictionSchema.methods.isStillValid = function() {
  const daysSincePrediction = Math.floor(
    (new Date() - this.predictionDate) / (1000 * 60 * 60 * 24)
  );
  
  return daysSincePrediction === 0;  // Same day as prediction
};

/**
 * Get user-friendly prediction summary
 */
billPredictionSchema.methods.getSummary = function() {
  return {
    period: {
      start: this.predictionPeriod.startDate,
      end: this.predictionPeriod.endDate
    },
    prediction: {
      consumption: this.predictions.consumptionPrediction.value,
      bill: this.predictions.billPrediction.value,
      confidence: `${this.predictions.billPrediction.confidence}%`
    },
    budgetStatus: {
      monthlyBudget: this.budgetComparison.monthlyBudget,
      predictedBill: this.budgetComparison.predictedBill,
      difference: this.budgetComparison.difference,
      percentageOfBudget: `${this.budgetComparison.percentageOfBudget}%`,
      willExceed: this.budgetComparison.willExceed,
      warningLevel: this.budgetComparison.warningLevel
    },
    recommendations: this.recommendations,
    reliability: `${this.reliability.overallScore}%`
  };
};

/**
 * Compare with actual data (when actual bill becomes available)
 */
billPredictionSchema.methods.compareWithActual = function(actualConsumption, actualBill) {
  const consumptionError = Math.abs(
    ((this.predictions.consumptionPrediction.value - actualConsumption) / actualConsumption) * 100
  );
  
  const billError = Math.abs(
    ((this.predictions.billPrediction.value - actualBill) / actualBill) * 100
  );
  
  return {
    predicted: {
      consumption: this.predictions.consumptionPrediction.value,
      bill: this.predictions.billPrediction.value
    },
    actual: {
      consumption: actualConsumption,
      bill: actualBill
    },
    accuracy: {
      consumptionAccuracy: Number((100 - consumptionError).toFixed(2)),
      billAccuracy: Number((100 - billError).toFixed(2)),
      averageAccuracy: Number(((100 - (consumptionError + billError) / 2)).toFixed(2))
    }
  };
};

// Static Methods

/**
 * Get latest prediction for household
 */
billPredictionSchema.statics.getLatestPrediction = function(householdId) {
  return this.findOne({
    householdId,
    isActive: true,
    status: { $in: ['provisional', 'confirmed'] }
  })
    .populate('tariffId', 'name')
    .populate('budgetId', 'monthlyLimit')
    .sort({ createdAt: -1 });
};

/**
 * Get prediction by period
 */
billPredictionSchema.statics.getPredictionByPeriod = function(householdId, startDate, endDate) {
  return this.findOne({
    householdId,
    'predictionPeriod.startDate': startDate,
    'predictionPeriod.endDate': endDate,
    isActive: true
  });
};

/**
 * Get all predictions for household (recent first)
 */
billPredictionSchema.statics.getPredictionHistory = function(householdId, limit = 12) {
  return this.find({
    householdId,
    isActive: true
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('tariffId', 'name');
};

/**
 * Get at-risk predictions (will exceed budget)
 */
billPredictionSchema.statics.getAtRiskPredictions = function() {
  return this.find({
    isActive: true,
    'budgetComparison.willExceed': true
  })
    .populate('householdId', 'name')
    .populate('userId', 'email name')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('BillPrediction', billPredictionSchema);