const consumptionService = require('../services/consumptionService');
const { validateRecordConsumption, validateUpdateConsumption } = require('../validators/consumptionValidator');

class ConsumptionController {
  /**
   * POST /api/v1/consumption
   * Record new consumption
   */
  async recordConsumption(req, res) {
    try {
      const { error, value } = validateRecordConsumption(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const record = await consumptionService.recordConsumption(value, req.user._id);

      res.status(201).json({
        success: true,
        message: 'Consumption recorded successfully',
        data: record
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/consumption
   * Get consumption by household (paginated)
   */
  async getConsumption(req, res) {
    try {
      const { householdId } = req.query;
      const limit = Math.min(parseInt(req.query.limit) || 100, 500);
      const skip = parseInt(req.query.skip) || 0;

      if (!householdId) {
        return res.status(400).json({
          success: false,
          message: 'Household ID is required'
        });
      }

      const result = await consumptionService.getByHousehold(householdId, limit, skip);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/consumption/range
   * Get consumption for date range
   */
  async getConsumptionInRange(req, res) {
    try {
      const { householdId, startDate, endDate } = req.query;

      if (!householdId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Household ID, start date, and end date are required'
        });
      }

      const records = await consumptionService.getConsumptionInRange(
        householdId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: records,
        count: records.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/consumption/daily/:householdId/:date
   * Get daily consumption for specific date
   */
  async getDailyConsumption(req, res) {
    try {
      const { householdId, date } = req.params;

      const record = await consumptionService.getDailyConsumption(householdId, date);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'No consumption data for this date'
        });
      }

      res.status(200).json({
        success: true,
        data: record
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/consumption/last-days/:householdId
   * Get last N days consumption
   */
  async getLastNDays(req, res) {
    try {
      const { householdId } = req.params;
      const days = Math.min(parseInt(req.query.days) || 30, 365);

      const records = await consumptionService.getLastNDays(householdId, days);

      res.status(200).json({
        success: true,
        data: records,
        count: records.length,
        days
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/consumption/anomalies/:householdId
   * Get consumption anomalies
   */
  async getAnomalies(req, res) {
    try {
      const { householdId } = req.params;
      const days = Math.min(parseInt(req.query.days) || 30, 365);

      const anomalies = await consumptionService.getAnomalies(householdId, days);

      res.status(200).json({
        success: true,
        data: anomalies,
        count: anomalies.length,
        period: `Last ${days} days`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/consumption/analytics/:householdId
   * Get consumption analytics and insights
   */
  async getAnalytics(req, res) {
    try {
      const { householdId } = req.params;
      const days = Math.min(parseInt(req.query.days) || 30, 365);

      const analytics = await consumptionService.getAnalytics(householdId, days);

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/consumption/average
   * Get average consumption for period
   */
  async getAverageConsumption(req, res) {
    try {
      const { householdId, startDate, endDate } = req.query;

      if (!householdId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Household ID, start date, and end date are required'
        });
      }

      const stats = await consumptionService.calculateAverageConsumption(
        householdId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/consumption/trend/:householdId
   * Get consumption trend
   */
  async getTrend(req, res) {
    try {
      const { householdId } = req.params;
      const days = Math.min(parseInt(req.query.days) || 30, 365);

      const trend = await consumptionService.getTrend(householdId, days);

      res.status(200).json({
        success: true,
        data: trend,
        days,
        count: trend.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/consumption/weekly-summary/:householdId
   * Get weekly consumption summary
   */
  async getWeeklySummary(req, res) {
    try {
      const { householdId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const summary = await consumptionService.getWeeklySummary(
        householdId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: summary,
        weeks: summary.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/consumption/monthly-summary/:householdId
   * Get monthly consumption summary
   */
  async getMonthlySummary(req, res) {
    try {
      const { householdId } = req.params;

      const summary = await consumptionService.getMonthlySummary(householdId);

      res.status(200).json({
        success: true,
        data: summary,
        months: summary.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/v1/consumption/compare
   * Compare consumption between two periods
   */
  async compareConsumption(req, res) {
    try {
      const { householdId, period1Start, period1End, period2Start, period2End } = req.body;

      if (!householdId || !period1Start || !period1End || !period2Start || !period2End) {
        return res.status(400).json({
          success: false,
          message: 'Household ID and all period dates are required'
        });
      }

      const comparison = await consumptionService.compareConsumption(
        householdId,
        period1Start,
        period1End,
        period2Start,
        period2End
      );

      res.status(200).json({
        success: true,
        data: comparison
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/v1/consumption/:id
   * Update consumption record
   */
  async updateConsumption(req, res) {
    try {
      const { id } = req.params;

      const { error, value } = validateUpdateConsumption(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const record = await consumptionService.updateConsumption(id, value, req.user._id);

      res.status(200).json({
        success: true,
        message: 'Consumption updated successfully',
        data: record
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/v1/consumption/:id/verify
   * Verify or flag consumption record
   */
  async verifyConsumption(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status || !['recorded', 'verified', 'flagged', 'corrected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status is required: recorded, verified, flagged, corrected'
        });
      }

      const record = await consumptionService.verifyConsumption(id, status, notes);

      res.status(200).json({
        success: true,
        message: `Consumption marked as ${status}`,
        data: record
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/v1/consumption/bulk-import
   * Bulk import consumption records
   */
  async bulkImportConsumption(req, res) {
    try {
      const { householdId, records } = req.body;

      if (!householdId || !Array.isArray(records)) {
        return res.status(400).json({
          success: false,
          message: 'Household ID and records array are required'
        });
      }

      const result = await consumptionService.bulkImportConsumption(
        householdId,
        records,
        req.user._id
      );

      res.status(201).json({
        success: true,
        message: `${result.inserted} records imported successfully`,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/v1/consumption/:id
   * Delete consumption record
   */
  async deleteConsumption(req, res) {
    try {
      const { id } = req.params;

      const record = await consumptionService.deleteConsumption(id);

      res.status(200).json({
        success: true,
        message: 'Consumption record deleted successfully',
        data: record
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/v1/consumption/check-anomaly
   * Check if current consumption is anomalous
   */
  async checkAnomaly(req, res) {
    try {
      const { householdId, currentConsumption, dailyAverage, threshold } = req.body;

      if (!householdId || currentConsumption === undefined || !dailyAverage) {
        return res.status(400).json({
          success: false,
          message: 'Household ID, current consumption, and daily average are required'
        });
      }

      const isAnomaly = await consumptionService.checkAnomaly(
        householdId,
        currentConsumption,
        dailyAverage,
        threshold || 50
      );

      res.status(200).json({
        success: true,
        data: {
          isAnomaly,
          currentConsumption,
          dailyAverage,
          threshold: threshold || 50,
          percentageChange: Number(
            (((currentConsumption - dailyAverage) / dailyAverage) * 100).toFixed(2)
          )
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ConsumptionController();