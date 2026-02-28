const BillPrediction = require('../models/billPrediction');
const ConsumptionRecord = require('../models/consumptionRecord');
const TariffPlan = require('../models/TariffPlan');
const BudgetPlan = require('../models/budgetPlan');

class BillPredictionService {
  /**
   * Create bill prediction for a household
   */
  async predictBill(householdId, budgetId = null) {
    try {
      // Get current tariff
      const tariff = await TariffPlan.getActiveTariff();
      if (!tariff) {
        throw new Error('No active tariff found');
      }

      // Get budget if provided
      let budget = null;
      if (budgetId) {
        budget = await BudgetPlan.findById(budgetId);
      } else {
        budget = await BudgetPlan.getCurrentMonthBudget(householdId);
      }

      // Get current month data
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get consumption records for current month
      const currentConsumptions = await ConsumptionRecord.getConsumptionInRange(
        householdId,
        startOfMonth,
        endOfMonth
      );

      if (currentConsumptions.length === 0) {
        throw new Error('No consumption data available for current period');
      }

      // Calculate current totals
      const currentConsumption = currentConsumptions.reduce((sum, record) => 
        sum + record.consumption, 0);
      const currentBill = tariff.calculateBill(currentConsumption).total;

      // Get historical data for trend analysis
      const lastMonthStart = new Date(startOfMonth);
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      const lastMonthEnd = new Date(startOfMonth);
      lastMonthEnd.setDate(0);

      const lastMonthConsumptions = await ConsumptionRecord.getConsumptionInRange(
        householdId,
        lastMonthStart,
        lastMonthEnd
      );

      const lastMonthConsumption = lastMonthConsumptions.reduce((sum, record) =>
        sum + record.consumption, 0);
      const lastMonthBill = tariff.calculateBill(lastMonthConsumption).total;

      // Calculate average daily consumption
      const daysElapsed = Math.ceil((now - startOfMonth) / (1000 * 60 * 60 * 24));
      const daysInMonth = endOfMonth.getDate();
      const avgDailyConsumption = currentConsumption / daysElapsed;
      const avgDailyBill = currentBill / daysElapsed;

      // Calculate trend
      const trend = this.calculateTrend(currentConsumption, lastMonthConsumption);
      const trendPercentage = ((currentConsumption - lastMonthConsumption) / 
        (lastMonthConsumption || 1)) * 100;

      // Detect anomalies
      const anomalies = currentConsumptions.filter(c => c.isAnomaly);

      // Make predictions using multiple methods
      const projectedConsumption = this.projectConsumption(
        avgDailyConsumption,
        daysElapsed,
        daysInMonth,
        trend,
        trendPercentage
      );

      const projectedBill = tariff.calculateBill(projectedConsumption);

      // Create prediction
      const predictionData = {
        householdId,
        userId: null,  // Will be set by controller
        budgetId: budget ? budget._id : null,
        tariffId: tariff._id,

        predictionPeriod: {
          startDate: startOfMonth,
          endDate: endOfMonth
        },

        analysisData: {
          currentDate: now,
          daysElapsed,
          daysRemaining: daysInMonth - daysElapsed,
          totalDaysInPeriod: daysInMonth,
          currentConsumption,
          currentBill
        },

        historicalData: {
          previousMonthConsumption: lastMonthConsumption,
          previousMonthBill: lastMonthBill,
          averageDailyConsumption: Number(avgDailyConsumption.toFixed(2)),
          averageDailyBill: Number(avgDailyBill.toFixed(2)),
          trend,
          trendPercentage: Number(trendPercentage.toFixed(2)),
          dataPoints: currentConsumptions.length
        },

        predictions: {
          consumptionPrediction: {
            value: Number(projectedConsumption.toFixed(2)),
            confidence: this.calculateConfidence(daysElapsed, daysInMonth, anomalies.length),
            method: 'trend-based-linear-projection',
            description: `Based on ${daysElapsed} days of data with ${trend} trend`
          },

          billPrediction: {
            value: Number(projectedBill.total.toFixed(2)),
            confidence: this.calculateConfidence(daysElapsed, daysInMonth, anomalies.length),
            breakdown: {
              energyCharge: Number(projectedBill.energyCharge.toFixed(2)),
              fixedCharge: projectedBill.fixedCharge,
              additionalCharges: Number(projectedBill.additionalCharges.toFixed(2)),
              taxes: Number((projectedBill.energyTax + projectedBill.fixedTax).toFixed(2)),
              VAT: Number(projectedBill.VAT.toFixed(2))
            },
            method: 'consumption-based-tariff-calculation',
            description: 'Using active tariff rates on projected consumption'
          },

          scenarios: this.generateScenarios(projectedConsumption, tariff)
        }
      };

      // Add budget comparison if budget exists
      if (budget) {
        predictionData.budgetComparison = {
          monthlyBudget: budget.monthlyLimit,
          predictedBill: projectedBill.total,
          difference: Number((budget.monthlyLimit - projectedBill.total).toFixed(2)),
          percentageOfBudget: Number(((projectedBill.total / budget.monthlyLimit) * 100).toFixed(2)),
          willExceed: projectedBill.total > budget.monthlyLimit,
          warningLevel: this.getWarningLevel((projectedBill.total / budget.monthlyLimit) * 100)
        };

        predictionData.recommendations = this.generateRecommendations(
          projectedBill.total,
          budget.monthlyLimit,
          trend,
          anomalies.length
        );
      }

      // Calculate reliability
      predictionData.reliability = {
        overallScore: this.calculateConfidence(daysElapsed, daysInMonth, anomalies.length),
        factors: {
          dataCompleteness: Math.floor((daysElapsed / daysInMonth) * 100),
          consistencyScore: 100 - (anomalies.length * 10),  // 10 points per anomaly
          seasonalAdjustment: 100,  // Default, can be customized
          anomalyCount: anomalies.length
        },
        notes: this.getReliabilityNotes(daysElapsed, daysInMonth, anomalies.length)
      };

      const prediction = new BillPrediction(predictionData);
      await prediction.save();

      return prediction;
    } catch (error) {
      throw new Error(`Failed to predict bill: ${error.message}`);
    }
  }

  /**
   * Calculate consumption trend
   */
  calculateTrend(currentConsumption, previousConsumption) {
    if (!previousConsumption) return 'stable';
    
    const change = ((currentConsumption - previousConsumption) / previousConsumption) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * Project consumption to end of month
   */
  projectConsumption(avgDaily, daysElapsed, daysInMonth, trend, trendPercentage) {
    // Base projection: average daily consumption × days remaining
    let projectedDaily = avgDaily;

    // Adjust for trend
    if (trend === 'increasing') {
      // Gradually increase projection
      const trendFactor = 1 + (trendPercentage / 100) * 0.5;  // Apply 50% of trend
      projectedDaily = avgDaily * trendFactor;
    } else if (trend === 'decreasing') {
      const trendFactor = 1 + (trendPercentage / 100) * 0.5;
      projectedDaily = avgDaily * trendFactor;
    }

    // Project to end of month
    const projectedConsumption = projectedDaily * daysInMonth;
    
    return projectedConsumption;
  }

  /**
   * Generate scenario predictions
   */
  generateScenarios(baseConsumption, tariff) {
    const scenarios = [
      {
        name: 'Conservative',
        consumptionAdjustment: -10,
        predictedConsumption: Number((baseConsumption * 0.9).toFixed(2)),
        predictedBill: Number(tariff.calculateBill(baseConsumption * 0.9).total.toFixed(2))
      },
      {
        name: 'Optimistic',
        consumptionAdjustment: 10,
        predictedConsumption: Number((baseConsumption * 1.1).toFixed(2)),
        predictedBill: Number(tariff.calculateBill(baseConsumption * 1.1).total.toFixed(2))
      }
    ];

    return scenarios;
  }

  /**
   * Calculate prediction confidence score
   */
  calculateConfidence(daysElapsed, daysInMonth, anomalyCount) {
    let confidence = 100;

    // Reduce confidence if not enough days passed
    if (daysElapsed < 7) confidence -= 30;
    else if (daysElapsed < 14) confidence -= 15;
    else if (daysElapsed < 21) confidence -= 5;

    // Reduce confidence for each anomaly
    confidence -= anomalyCount * 5;

    // Ensure between 40-100
    return Math.max(40, Math.min(100, confidence));
  }

  /**
   * Get warning level based on budget percentage
   */
  getWarningLevel(percentageOfBudget) {
    if (percentageOfBudget > 100) return 'red';
    if (percentageOfBudget > 80) return 'yellow';
    return 'green';
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(predictedBill, monthlyBudget, trend, anomalyCount) {
    const recommendations = [];

    if (predictedBill > monthlyBudget) {
      recommendations.push(
        `⚠️ Prediction: Your bill (Rs. ${predictedBill}) will EXCEED your budget (Rs. ${monthlyBudget})`
      );
      recommendations.push(
        `💡 Consider reducing consumption or increasing your budget limit`
      );
    } else if (predictedBill > monthlyBudget * 0.8) {
      recommendations.push(
        `📊 Prediction: Your bill (Rs. ${predictedBill}) will be 80% of your budget`
      );
      recommendations.push(
        `💡 Monitor consumption closely to avoid exceeding budget`
      );
    } else {
      recommendations.push(
        `✅ Prediction: Your bill (Rs. ${predictedBill}) is within budget (Rs. ${monthlyBudget})`
      );
    }

    if (trend === 'increasing') {
      recommendations.push(
        `📈 Consumption is INCREASING. Consider checking for equipment issues or unusual usage`
      );
    } else if (trend === 'decreasing') {
      recommendations.push(
        `📉 Consumption is DECREASING. Good! Continue with your efficient usage habits`
      );
    }

    if (anomalyCount > 0) {
      recommendations.push(
        `🚨 ${anomalyCount} usage anomal(ies) detected. Review high-consumption days`
      );
    }

    return recommendations;
  }

  /**
   * Get reliability notes
   */
  getReliabilityNotes(daysElapsed, daysInMonth, anomalyCount) {
    const percentComplete = Math.floor((daysElapsed / daysInMonth) * 100);
    
    if (percentComplete < 10) {
      return `Only ${percentComplete}% of month complete. Prediction may be inaccurate.`;
    } else if (percentComplete < 50) {
      return `${percentComplete}% of month complete. Prediction confidence increasing as data accumulates.`;
    } else {
      return `${percentComplete}% of month complete. Prediction highly reliable.`;
    }
  }

  /**
   * Get latest prediction for household
   */
  async getLatestPrediction(householdId) {
    try {
      const prediction = await BillPrediction.getLatestPrediction(householdId);

      if (!prediction) {
        throw new Error('No prediction found for this household');
      }

      return prediction;
    } catch (error) {
      throw new Error(`Failed to get prediction: ${error.message}`);
    }
  }

  /**
   * Get prediction by period
   */
  async getPredictionByPeriod(householdId, startDate, endDate) {
    try {
      const prediction = await BillPrediction.getPredictionByPeriod(
        householdId,
        new Date(startDate),
        new Date(endDate)
      );

      if (!prediction) {
        throw new Error('No prediction found for this period');
      }

      return prediction;
    } catch (error) {
      throw new Error(`Failed to get prediction: ${error.message}`);
    }
  }

  /**
   * Get prediction history
   */
  async getPredictionHistory(householdId, months = 12) {
    try {
      return await BillPrediction.getPredictionHistory(householdId, months)
        .populate('tariffId', 'name')
        .populate('budgetId', 'monthlyLimit');
    } catch (error) {
      throw new Error(`Failed to get prediction history: ${error.message}`);
    }
  }

  /**
   * Get at-risk predictions (admin)
   */
  async getAtRiskPredictions() {
    try {
      return await BillPrediction.getAtRiskPredictions();
    } catch (error) {
      throw new Error(`Failed to get at-risk predictions: ${error.message}`);
    }
  }

  /**
   * Compare prediction with actual results
   */
  async comparePredictionWithActual(predictionId, actualConsumption, actualBill) {
    try {
      const prediction = await BillPrediction.findById(predictionId);

      if (!prediction) {
        throw new Error('Prediction not found');
      }

      const comparison = prediction.compareWithActual(actualConsumption, actualBill);
      
      // Mark prediction as outdated
      prediction.status = 'outdated';
      await prediction.save();

      return comparison;
    } catch (error) {
      throw new Error(`Failed to compare prediction: ${error.message}`);
    }
  }

  /**
   * Update prediction status
   */
  async updatePredictionStatus(predictionId, status) {
    try {
      const validStatuses = ['provisional', 'confirmed', 'outdated'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const prediction = await BillPrediction.findByIdAndUpdate(
        predictionId,
        { status },
        { new: true }
      );

      if (!prediction) {
        throw new Error('Prediction not found');
      }

      return prediction;
    } catch (error) {
      throw new Error(`Failed to update prediction: ${error.message}`);
    }
  }

  /**
   * Get prediction summary with all details
   */
  async getPredictionSummary(predictionId) {
    try {
      const prediction = await BillPrediction.findById(predictionId)
        .populate('tariffId', 'name provider')
        .populate('budgetId', 'monthlyLimit');

      if (!prediction) {
        throw new Error('Prediction not found');
      }

      return prediction.getSummary();
    } catch (error) {
      throw new Error(`Failed to get prediction summary: ${error.message}`);
    }
  }

  /**
   * Delete old predictions
   */
  async deleteOldPredictions(householdId, monthsToKeep = 12) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);

      const result = await BillPrediction.deleteMany({
        householdId,
        createdAt: { $lt: cutoffDate }
      });

      return {
        deleted: result.deletedCount,
        message: `Deleted ${result.deletedCount} old predictions`
      };
    } catch (error) {
      throw new Error(`Failed to delete old predictions: ${error.message}`);
    }
  }
}

module.exports = new BillPredictionService();