const ConsumptionRecord = require('../models/consumptionRecord');
const alertService = require('./alertService');

class UsageSpikeService {
 
  async checkSpike(householdId, userId, currentConsumption, threshold = 50) {
    try {
      // Get last 30 days of consumption
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const records = await ConsumptionRecord.getConsumptionInRange(
        householdId,
        startDate,
        endDate
      );

      if (records.length === 0) {
        throw new Error('No consumption history available');
      }

      // Calculate daily average
      const totalConsumption = records.reduce((sum, record) => sum + record.consumption, 0);
      const dailyAverage = totalConsumption / records.length;

      // Calculate percentage change
      const percentageChange = ((currentConsumption - dailyAverage) / dailyAverage) * 100;

      // Determine if spike
      const isSpike = Math.abs(percentageChange) > threshold;
      const severity = Math.abs(percentageChange) > 75 ? 'high' : 'medium';

      const spikeData = {
        consumption: currentConsumption,
        dailyAverage,
        averageDaily: Number(dailyAverage.toFixed(2)),
        percentageChange: Number(percentageChange.toFixed(2)),
        threshold,
        isSpike,
        severity,
        dataPoints: records.length,
        period: '30 days'
      };

      // Create alert if spike detected
      if (isSpike) {
        await alertService.createSpikeAlert(householdId, userId, spikeData);
      }

      return spikeData;
    } catch (error) {
      throw new Error(`Failed to check spike: ${error.message}`);
    }
  }

  async detectAnomalies(householdId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const records = await ConsumptionRecord.getConsumptionInRange(
        householdId,
        startDate,
        endDate
      );

      if (records.length === 0) {
        return {
          anomalies: [],
          totalRecords: 0
        };
      }

      // Calculate statistics
      const consumptions = records.map(r => r.consumption);
      const mean = consumptions.reduce((a, b) => a + b) / consumptions.length;
      
      // Calculate standard deviation
      const variance = consumptions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / consumptions.length;
      const stdDev = Math.sqrt(variance);

      // Find anomalies (values outside 2 standard deviations)
      const anomalies = records.filter(record => {
        const zScore = Math.abs((record.consumption - mean) / stdDev);
        return zScore > 2;
      });

      return {
        anomalies: anomalies.map(a => ({
          date: a.readingDate,
          consumption: a.consumption,
          zScore: Number(Math.abs((a.consumption - mean) / stdDev).toFixed(2)),
          severity: Math.abs((a.consumption - mean) / stdDev) > 3 ? 'high' : 'medium'
        })),
        totalRecords: records.length,
        statistics: {
          mean: Number(mean.toFixed(2)),
          stdDev: Number(stdDev.toFixed(2)),
          min: Math.min(...consumptions),
          max: Math.max(...consumptions)
        }
      };
    } catch (error) {
      throw new Error(`Failed to detect anomalies: ${error.message}`);
    }
  }

  async analyzeSpikeDetail(householdId, spikeDate) {
    try {
      // Get spike day
      const spikeRecord = await ConsumptionRecord.getDailyConsumption(householdId, spikeDate);

      if (!spikeRecord) {
        throw new Error('No consumption data for this date');
      }

      // Get previous 7 days
      const endDate = new Date(spikeDate);
      const startDate = new Date(spikeDate);
      startDate.setDate(startDate.getDate() - 7);

      const weekRecords = await ConsumptionRecord.getConsumptionInRange(
        householdId,
        startDate,
        endDate
      );

      const weekAverage = weekRecords.reduce((sum, r) => sum + r.consumption, 0) / weekRecords.length;
      const percentageAboveWeek = ((spikeRecord.consumption - weekAverage) / weekAverage) * 100;

      // Get same day last month
      const lastMonthDate = new Date(spikeDate);
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      
      const lastMonthRecord = await ConsumptionRecord.getDailyConsumption(
        householdId,
        lastMonthDate
      );

      let monthComparison = null;
      if (lastMonthRecord) {
        const percentageAboveLastMonth = ((spikeRecord.consumption - lastMonthRecord.consumption) / lastMonthRecord.consumption) * 100;
        monthComparison = {
          lastMonthConsumption: lastMonthRecord.consumption,
          percentageChange: Number(percentageAboveLastMonth.toFixed(2))
        };
      }

      return {
        spikeDate,
        spikeConsumption: spikeRecord.consumption,
        weekAverage: Number(weekAverage.toFixed(2)),
        percentageAboveWeek: Number(percentageAboveWeek.toFixed(2)),
        monthComparison,
        severity: Math.abs(percentageAboveWeek) > 75 ? 'high' : 'medium',
        recommendation: this.getSpikeRecommendation(percentageAboveWeek)
      };
    } catch (error) {
      throw new Error(`Failed to analyze spike: ${error.message}`);
    }
  }

  async getSpikesHistory(householdId, days = 30) {
    try {
      const anomalies = await ConsumptionRecord.getAnomalies(householdId, days);

      return {
        spikes: anomalies.map(a => ({
          date: a.readingDate,
          consumption: a.consumption,
          anomalyReason: a.anomalyReason,
          severity: this.getSpikeSeverity(a.consumption)
        })),
        totalSpikes: anomalies.length,
        period: `Last ${days} days`
      };
    } catch (error) {
      throw new Error(`Failed to get spike history: ${error.message}`);
    }
  }

  async compareWithAverage(householdId, date) {
    try {
      const dailyRecord = await ConsumptionRecord.getDailyConsumption(householdId, date);

      if (!dailyRecord) {
        throw new Error('No consumption data for this date');
      }

      // Get 30-day average
      const endDate = new Date(date);
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 30);

      const records = await ConsumptionRecord.getConsumptionInRange(
        householdId,
        startDate,
        endDate
      );

      const average = records.reduce((sum, r) => sum + r.consumption, 0) / records.length;
      const percentageChange = ((dailyRecord.consumption - average) / average) * 100;

      return {
        date,
        actualConsumption: dailyRecord.consumption,
        averageConsumption: Number(average.toFixed(2)),
        difference: Number((dailyRecord.consumption - average).toFixed(2)),
        percentageChange: Number(percentageChange.toFixed(2)),
        isAboveAverage: dailyRecord.consumption > average,
        severity: this.getSpikeSeverity(percentageChange)
      };
    } catch (error) {
      throw new Error(`Failed to compare with average: ${error.message}`);
    }
  }

  getSpikeSeverity(percentageChange) {
    const absChange = Math.abs(percentageChange);
    if (absChange > 75) return 'high';
    if (absChange > 50) return 'medium';
    if (absChange > 25) return 'low';
    return 'normal';
  }

  getSpikeRecommendation(percentageChange) {
    const severity = this.getSpikeSeverity(percentageChange);

    const recommendations = {
      high: [
        'Check for running appliances',
        'Verify AC/Heater settings',
        'Check for meter issues',
        'Look for equipment failures'
      ],
      medium: [
        'Review appliance usage',
        'Check temperature settings',
        'Consider energy-saving measures'
      ],
      low: [
        'Monitor usage trend',
        'Usage within expected range'
      ],
      normal: ['Usage is normal']
    };

    return recommendations[severity] || recommendations.normal;
  }

  async identifySpikeCauses(householdId, spikeDate) {
    try {
      const analysis = await this.analyzeSpikeDetail(householdId, spikeDate);

      const causes = [];

      if (analysis.percentageAboveWeek > 50) {
        causes.push('Significant increase compared to recent days');
      }

      if (analysis.monthComparison && analysis.monthComparison.percentageChange > 50) {
        causes.push('Significantly higher than same day last month');
      }

      if (analysis.severity === 'high') {
        causes.push('Possibly an appliance failure or malfunction');
        causes.push('Check for unusual equipment running');
      }

      return {
        date: spikeDate,
        severity: analysis.severity,
        possibleCauses: causes.length > 0 ? causes : ['Check for unusual appliance usage'],
        recommendation: 'Review recent activities and appliance usage on this date'
      };
    } catch (error) {
      throw new Error(`Failed to identify spike causes: ${error.message}`);
    }
  }
}

module.exports = new UsageSpikeService();