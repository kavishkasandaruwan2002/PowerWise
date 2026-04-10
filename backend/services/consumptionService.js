const ConsumptionRecord = require('../models/consumptionRecord');

class ConsumptionService {
  /**
   * Record new consumption
   */
  async recordConsumption(consumptionData, userId) {
    try {
      // Validate required fields
      if (!consumptionData.householdId || consumptionData.consumption === undefined) {
        throw new Error('Household ID and consumption value are required');
      }

      if (consumptionData.consumption < 0) {
        throw new Error('Consumption cannot be negative');
      }

      // Set user info
      consumptionData.userId = userId;
      consumptionData.createdBy = userId;

      // Set reading date if not provided
      if (!consumptionData.readingDate) {
        consumptionData.readingDate = new Date();
      }

      // Check for anomalies if daily average is available
      if (consumptionData.dailyAverage) {
        const isAnomaly = await this.checkAnomaly(
          consumptionData.householdId,
          consumptionData.consumption,
          consumptionData.dailyAverage
        );
        if (isAnomaly) {
          consumptionData.isAnomaly = true;
          consumptionData.status = 'flagged';
        }
      }

      const record = new ConsumptionRecord(consumptionData);
      await record.save();

      // Trigger related async workflows for threshold and spike alerts
      setImmediate(async () => {
        try {
          // 1. Check for spikes & trigger alert
          const usageSpikeService = require('./usageSpikeService');
          await usageSpikeService.checkSpike(
            consumptionData.householdId,
            userId,
            consumptionData.consumption
          ).catch(e => console.log('Spike check skipped:', e.message));

          // 2. Update active budget & trigger budget alerts
          const budgetService = require('./budgetService');
          const activeBudget = await budgetService.getActiveBudget(consumptionData.householdId);
          if (activeBudget) {
            // Since updateConsumption expects cumulative consumption, we need to get updated month consumption
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const consumptions = await this.getConsumptionInRange(consumptionData.householdId, startOfMonth, endOfMonth);
            const totalMonthly = consumptions.reduce((sum, rec) => sum + rec.consumption, 0);
            
            await budgetService.updateConsumption(activeBudget._id, totalMonthly);
          }
        } catch (error) {
          console.error('Workflow trigger failed after recording consumption:', error);
        }
      });

      return record;
    } catch (error) {
      throw new Error(`Failed to record consumption: ${error.message}`);
    }
  }

  /**
   * Get consumption for date range
   */
  async getConsumptionInRange(householdId, startDate, endDate) {
    try {
      if (!householdId || !startDate || !endDate) {
        throw new Error('Household ID, start date, and end date are required');
      }

      return await ConsumptionRecord.getConsumptionInRange(
        householdId,
        new Date(startDate),
        new Date(endDate)
      );
    } catch (error) {
      throw new Error(`Failed to get consumption in range: ${error.message}`);
    }
  }

  /**
   * Get daily consumption for specific date
   */
  async getDailyConsumption(householdId, date) {
    try {
      return await ConsumptionRecord.getDailyConsumption(householdId, new Date(date));
    } catch (error) {
      throw new Error(`Failed to get daily consumption: ${error.message}`);
    }
  }

  /**
   * Get last N days consumption
   */
  async getLastNDays(householdId, days = 30) {
    try {
      return await ConsumptionRecord.getLastNDays(householdId, days)
        .populate('householdId', 'name')
        .select('-__v');
    } catch (error) {
      throw new Error(`Failed to get last ${days} days: ${error.message}`);
    }
  }

  /**
   * Get consumption anomalies
   */
  async getAnomalies(householdId, days = 30) {
    try {
      return await ConsumptionRecord.getAnomalies(householdId, days)
        .populate('householdId', 'name')
        .select('-__v');
    } catch (error) {
      throw new Error(`Failed to get anomalies: ${error.message}`);
    }
  }

  /**
   * Calculate average consumption
   */
  async calculateAverageConsumption(householdId, startDate, endDate) {
    try {
      const result = await ConsumptionRecord.calculateAverageConsumption(
        householdId,
        new Date(startDate),
        new Date(endDate)
      );

      if (result.length === 0) {
        return {
          averageConsumption: 0,
          totalConsumption: 0,
          maxConsumption: 0,
          minConsumption: 0,
          count: 0
        };
      }

      return {
        averageConsumption: Number(result[0].averageConsumption.toFixed(2)),
        totalConsumption: Number(result[0].totalConsumption.toFixed(2)),
        maxConsumption: Number(result[0].maxConsumption.toFixed(2)),
        minConsumption: Number(result[0].minConsumption.toFixed(2)),
        count: result[0].count
      };
    } catch (error) {
      throw new Error(`Failed to calculate average consumption: ${error.message}`);
    }
  }

  /**
   * Get consumption trend
   */
  async getTrend(householdId, days = 30) {
    try {
      const trend = await ConsumptionRecord.getTrend(householdId, days);

      if (trend.length === 0) {
        return [];
      }

      return trend.map(item => ({
        date: item._id,
        dailyConsumption: Number(item.dailyConsumption.toFixed(2)),
        avgConsumption: Number(item.avgConsumption.toFixed(2)),
        readingCount: item.readingCount
      }));
    } catch (error) {
      throw new Error(`Failed to get trend: ${error.message}`);
    }
  }

  /**
   * Get weekly summary
   */
  async getWeeklySummary(householdId, startDate, endDate) {
    try {
      const summary = await ConsumptionRecord.getWeeklySummary(
        householdId,
        new Date(startDate),
        new Date(endDate)
      );

      return summary.map(item => ({
        week: item._id,
        weeklyConsumption: Number(item.weeklyConsumption.toFixed(2)),
        avgDaily: Number(item.avgDaily.toFixed(2)),
        maxDaily: Number(item.maxDaily.toFixed(2)),
        minDaily: Number(item.minDaily.toFixed(2))
      }));
    } catch (error) {
      throw new Error(`Failed to get weekly summary: ${error.message}`);
    }
  }

  /**
   * Get monthly summary
   */
  async getMonthlySummary(householdId) {
    try {
      const summary = await ConsumptionRecord.getMonthlySummary(householdId);

      return summary.map(item => ({
        period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        monthlyConsumption: Number(item.monthlyConsumption.toFixed(2)),
        avgDaily: Number(item.avgDaily.toFixed(2)),
        maxDaily: Number(item.maxDaily.toFixed(2)),
        minDaily: Number(item.minDaily.toFixed(2)),
        daysWithData: item.daysWithData
      }));
    } catch (error) {
      throw new Error(`Failed to get monthly summary: ${error.message}`);
    }
  }

  /**
   * Check if consumption is anomalous
   */
  async checkAnomaly(householdId, currentConsumption, dailyAverage, threshold = 50) {
    try {
      if (!dailyAverage || dailyAverage === 0) {
        return false;
      }

      const percentageChange = ((currentConsumption - dailyAverage) / dailyAverage) * 100;
      const isAnomaly = Math.abs(percentageChange) > threshold;

      return isAnomaly;
    } catch (error) {
      throw new Error(`Failed to check anomaly: ${error.message}`);
    }
  }

  /**
   * Update consumption record
   */
  async updateConsumption(recordId, updateData, userId) {
    try {
      const record = await ConsumptionRecord.findById(recordId);

      if (!record) {
        throw new Error('Consumption record not found');
      }

      // Prevent changing certain fields
      delete updateData.householdId;
      delete updateData.userId;
      delete updateData.createdBy;

      // Update fields
      Object.assign(record, updateData);
      record.updatedAt = new Date();

      await record.save();

      return record;
    } catch (error) {
      throw new Error(`Failed to update consumption: ${error.message}`);
    }
  }

  /**
   * Verify/flag consumption record
   */
  async verifyConsumption(recordId, status, notes) {
    try {
      const record = await ConsumptionRecord.findByIdAndUpdate(
        recordId,
        {
          status,
          notes: notes || record.notes
        },
        { new: true }
      );

      if (!record) {
        throw new Error('Consumption record not found');
      }

      return record;
    } catch (error) {
      throw new Error(`Failed to verify consumption: ${error.message}`);
    }
  }

  /**
   * Get consumption analytics
   */
  async getAnalytics(householdId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const endDate = new Date();

      // Get stats
      const stats = await this.calculateAverageConsumption(householdId, startDate, endDate);
      const trend = await this.getTrend(householdId, days);
      const anomalies = await this.getAnomalies(householdId, days);

      // Calculate daily average
      const dailyAverage = stats.averageConsumption;

      // Calculate trend (increase/decrease)
      let trendPercentage = 0;
      if (trend.length > 1) {
        const firstWeekAvg = trend.slice(0, Math.ceil(trend.length / 4))
          .reduce((sum, day) => sum + day.dailyConsumption, 0) / Math.ceil(trend.length / 4);
        const lastWeekAvg = trend.slice(-Math.ceil(trend.length / 4))
          .reduce((sum, day) => sum + day.dailyConsumption, 0) / Math.ceil(trend.length / 4);
        trendPercentage = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
      }

      return {
        period: {
          startDate,
          endDate,
          days
        },
        statistics: stats,
        trend: {
          direction: trendPercentage > 0 ? 'increasing' : 'decreasing',
          percentageChange: Number(trendPercentage.toFixed(2))
        },
        anomalies: {
          count: anomalies.length,
          recent: anomalies.slice(0, 5)
        },
        dailyData: trend
      };
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }

  /**
   * Compare consumption between periods
   */
  async compareConsumption(householdId, period1Start, period1End, period2Start, period2End) {
    try {
      const stats1 = await this.calculateAverageConsumption(householdId, period1Start, period1End);
      const stats2 = await this.calculateAverageConsumption(householdId, period2Start, period2End);

      const difference = stats2.totalConsumption - stats1.totalConsumption;
      const percentageChange = stats1.totalConsumption > 0
        ? (difference / stats1.totalConsumption) * 100
        : 0;

      return {
        period1: {
          start: period1Start,
          end: period1End,
          ...stats1
        },
        period2: {
          start: period2Start,
          end: period2End,
          ...stats2
        },
        comparison: {
          difference: Number(difference.toFixed(2)),
          percentageChange: Number(percentageChange.toFixed(2)),
          increased: difference > 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to compare consumption: ${error.message}`);
    }
  }

  /**
   * Bulk import consumption records
   */
  async bulkImportConsumption(householdId, records, userId) {
    try {
      if (!Array.isArray(records) || records.length === 0) {
        throw new Error('Records must be a non-empty array');
      }

      const preparedRecords = records.map(record => ({
        ...record,
        householdId,
        userId,
        createdBy: userId,
        sourceSystem: 'import'
      }));

      const result = await ConsumptionRecord.insertMany(preparedRecords);

      return {
        inserted: result.length,
        records: result
      };
    } catch (error) {
      throw new Error(`Failed to bulk import consumption: ${error.message}`);
    }
  }

  /**
   * Delete consumption record
   */
  async deleteConsumption(recordId) {
    try {
      const record = await ConsumptionRecord.findByIdAndDelete(recordId);

      if (!record) {
        throw new Error('Consumption record not found');
      }

      return record;
    } catch (error) {
      throw new Error(`Failed to delete consumption: ${error.message}`);
    }
  }

  /**
   * Get consumption by household
   */
  async getByHousehold(householdId, limit = 100, skip = 0) {
    try {
      const records = await ConsumptionRecord.find({ householdId })
        .sort({ readingDate: -1 })
        .limit(limit)
        .skip(skip);

      const total = await ConsumptionRecord.countDocuments({ householdId });

      return {
        data: records,
        pagination: {
          total,
          limit,
          skip,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get consumption by household: ${error.message}`);
    }
  }
}

module.exports = new ConsumptionService();