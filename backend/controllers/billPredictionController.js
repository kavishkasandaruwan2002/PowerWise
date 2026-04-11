const billPredictionService = require('../services/billPredictionService');

class BillPredictionController {
  /**
   * POST /api/v1/predictions
   * Create new bill prediction
   */
  async createPrediction(req, res) {
    try {
      const { householdId, budgetId } = req.body;

      if (!householdId) {
        return res.status(400).json({
          success: false,
          message: 'Household ID is required'
        });
      }

      const prediction = await billPredictionService.predictBill(householdId, budgetId, req.user._id);

      // Set user info
      prediction.userId = req.user._id;
      prediction.createdBy = req.user._id;
      await prediction.save();

      res.status(201).json({
        success: true,
        message: 'Bill prediction created successfully',
        data: prediction
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/predictions/latest/:householdId
   * Get latest prediction for household
   */
  async getLatestPrediction(req, res) {
    try {
      const { householdId } = req.params;

      const prediction = await billPredictionService.getLatestPrediction(householdId);

      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/predictions/period/:householdId
   * Get prediction for specific period
   * Query: ?startDate=2025-02-01&endDate=2025-02-28
   */
  async getPredictionByPeriod(req, res) {
    try {
      const { householdId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const prediction = await billPredictionService.getPredictionByPeriod(
        householdId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/predictions/history/:householdId
   * Get prediction history (last N months)
   * Query: ?months=12
   */
  async getPredictionHistory(req, res) {
    try {
      const { householdId } = req.params;
      const months = Math.min(parseInt(req.query.months) || 12, 60);

      const predictions = await billPredictionService.getPredictionHistory(householdId, months);

      res.status(200).json({
        success: true,
        data: predictions,
        count: predictions.length,
        months
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/predictions/:id
   * Get specific prediction
   */
  async getPredictionById(req, res) {
    try {
      const { id } = req.params;

      const prediction = await require('../models/billPrediction').findById(id)
        .populate('tariffId', 'name provider')
        .populate('budgetId', 'monthlyLimit');

      if (!prediction) {
        return res.status(404).json({
          success: false,
          message: 'Prediction not found'
        });
      }

      res.status(200).json({
        success: true,
        data: prediction
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/predictions/:id/summary
   * Get prediction summary (user-friendly)
   */
  async getPredictionSummary(req, res) {
    try {
      const { id } = req.params;

      const summary = await billPredictionService.getPredictionSummary(id);

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/v1/predictions/:id/compare
   * Compare prediction with actual results
   */
  async comparePredictionWithActual(req, res) {
    try {
      const { id } = req.params;
      const { actualConsumption, actualBill } = req.body;

      if (actualConsumption === undefined || actualBill === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Actual consumption and bill are required'
        });
      }

      const comparison = await billPredictionService.comparePredictionWithActual(
        id,
        actualConsumption,
        actualBill
      );

      res.status(200).json({
        success: true,
        message: 'Prediction compared with actual results',
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
   * PUT /api/v1/predictions/:id/status
   * Update prediction status
   */
  async updatePredictionStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const prediction = await billPredictionService.updatePredictionStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Prediction status updated',
        data: prediction
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/predictions/admin/at-risk
   * Get all at-risk predictions (admin only)
   */
  async getAtRiskPredictions(req, res) {
    try {
      const predictions = await billPredictionService.getAtRiskPredictions();

      res.status(200).json({
        success: true,
        data: predictions,
        count: predictions.length,
        message: `${predictions.length} households at risk of exceeding budget`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/v1/predictions/:householdId/forecast
   * Get detailed forecast with all scenarios
   */
  async getDetailedForecast(req, res) {
    try {
      const { householdId } = req.params;
      const { budgetId } = req.query;

      const prediction = await billPredictionService.predictBill(
        householdId,
        budgetId || null,
        req.user._id
      );

      res.status(200).json({
        success: true,
        message: 'Detailed forecast generated',
        data: {
          period: prediction.predictionPeriod,
          current: {
            consumption: prediction.analysisData.currentConsumption,
            bill: prediction.analysisData.currentBill,
            daysElapsed: prediction.analysisData.daysElapsed
          },
          historical: prediction.historicalData,
          forecast: {
            projectedConsumption: prediction.predictions.consumptionPrediction.value,
            projectedBill: prediction.predictions.billPrediction.value,
            confidence: `${prediction.predictions.billPrediction.confidence}`,
            breakdown: prediction.predictions.billPrediction.breakdown,
            description: prediction.predictions.consumptionPrediction.description
          },
          predictions: prediction.predictions,
          budgetComparison: prediction.budgetComparison,
          recommendations: prediction.recommendations,
          reliability: prediction.reliability
        }
      });
    } catch (error) {
      console.error('Forecast Error:', error.message);
      if (error.message.includes('No consumption data') ||
          error.message.includes('No active tariff') ||
          error.message.includes('No budget found')) {
        return res.status(200).json({
          success: true,
          message: 'Telemetry synchronization pending',
          data: null
        });
      }
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/predictions/:householdId/month-end
   * Get month-end forecast (what will the final bill be?)
   */
  async getMonthEndForecast(req, res) {
    try {
      const { householdId } = req.params;

      const prediction = await billPredictionService.getLatestPrediction(householdId);

      res.status(200).json({
        success: true,
        data: {
          householdId,
          period: prediction.predictionPeriod,
          currentStatus: {
            daysElapsed: prediction.analysisData.daysElapsed,
            daysRemaining: prediction.analysisData.daysRemaining,
            consumption: prediction.analysisData.currentConsumption,
            bill: prediction.analysisData.currentBill
          },
          forecast: {
            projectedConsumption: prediction.predictions.consumptionPrediction.value,
            projectedBill: prediction.predictions.billPrediction.value,
            confidence: `${prediction.predictions.billPrediction.confidence}`,
            breakdown: prediction.predictions.billPrediction.breakdown,
            description: prediction.predictions.consumptionPrediction.description
          },
          scenarios: prediction.predictions.scenarios,
          budgetStatus: prediction.budgetComparison,
          warnings: prediction.recommendations
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/v1/predictions/:householdId/old
   * Delete old predictions (keep last N months)
   */
  async deleteOldPredictions(req, res) {
    try {
      const { householdId } = req.params;
      const monthsToKeep = parseInt(req.query.monthsToKeep) || 12;

      const result = await billPredictionService.deleteOldPredictions(
        householdId,
        monthsToKeep
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new BillPredictionController();