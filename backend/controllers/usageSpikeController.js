const usageSpikeService = require('../services/usageSpikeService');

class UsageSpikeController {

  async checkSpike(req, res) {
    try {
      const { householdId, currentConsumption, threshold } = req.body;

      if (!householdId || currentConsumption === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Household ID and current consumption are required'
        });
      }

      if (currentConsumption < 0) {
        return res.status(400).json({
          success: false,
          message: 'Consumption cannot be negative'
        });
      }

      const spikeData = await usageSpikeService.checkSpike(
        householdId,
        req.user._id,
        currentConsumption,
        threshold || 50
      );

      res.status(200).json({
        success: true,
        data: spikeData,
        message: spikeData.isSpike ? '⚡ Spike detected!' : '✓ Normal consumption'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async detectAnomalies(req, res) {
    try {
      const { householdId } = req.params;
      const days = Math.min(parseInt(req.query.days) || 30, 365);

      const result = await usageSpikeService.detectAnomalies(householdId, days);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getSpikeHistory(req, res) {
    try {
      const { householdId } = req.params;
      const days = Math.min(parseInt(req.query.days) || 30, 365);

      const result = await usageSpikeService.getSpikesHistory(householdId, days);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async analyzeSpikeDetail(req, res) {
    try {
      const { householdId, spikeDate } = req.body;

      if (!householdId || !spikeDate) {
        return res.status(400).json({
          success: false,
          message: 'Household ID and spike date are required'
        });
      }

      const analysis = await usageSpikeService.analyzeSpikeDetail(
        householdId,
        new Date(spikeDate)
      );

      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async compareWithAverage(req, res) {
    try {
      const { householdId, date } = req.params;

      const comparison = await usageSpikeService.compareWithAverage(
        householdId,
        new Date(date)
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

  async identifySpikeCauses(req, res) {
    try {
      const { householdId, date } = req.params;

      const causes = await usageSpikeService.identifySpikeCauses(
        householdId,
        new Date(date)
      );

      res.status(200).json({
        success: true,
        data: causes
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UsageSpikeController();