const tariffService = require('../services/tariffService');
const { validateCreateTariff, validateUpdateTariff } = require('../validators/tariffValidator');

class TariffController {
  /**
   * GET /api/v1/tariffs
   * Get all tariff plans
   */
  async getAllTariffs(req, res) {
    try {
      const { isActive } = req.query;
      const activeOnly = isActive !== 'false';
      
      const tariffs = await tariffService.getAllTariffs(activeOnly);
      
      res.status(200).json({
        success: true,
        data: tariffs,
        count: tariffs.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/tariffs/active
   * Get currently active tariff
   */
  async getActiveTariff(req, res) {
    try {
      const tariff = await tariffService.getActiveTariff();
      
      res.status(200).json({
        success: true,
        data: tariff
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/tariffs/:id
   * Get specific tariff by ID
   */
  async getTariffById(req, res) {
    try {
      const { id } = req.params;
      const tariff = await tariffService.getTariffById(id);
      
      res.status(200).json({
        success: true,
        data: tariff
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/v1/tariffs
   * Create new tariff plan (Admin only)
   */
  async createTariff(req, res) {
    try {
      const { error, value } = validateCreateTariff(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }
      
      const tariff = await tariffService.createTariff(value, req.user._id);
      
      res.status(201).json({
        success: true,
        message: 'Tariff plan created successfully',
        data: tariff
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/v1/tariffs/:id
   * Update tariff plan (Admin only)
   */
  async updateTariff(req, res) {
    try {
      const { id } = req.params;
      
      const { error, value } = validateUpdateTariff(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }
      
      const tariff = await tariffService.updateTariff(id, value, req.user._id);
      
      res.status(200).json({
        success: true,
        message: 'Tariff plan updated successfully',
        data: tariff
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/v1/tariffs/:id
   * Deactivate tariff plan (Admin only)
   */
  async deleteTariff(req, res) {
    try {
      const { id } = req.params;
      
      const tariff = await tariffService.deactivateTariff(id, req.user._id);
      
      res.status(200).json({
        success: true,
        message: 'Tariff plan deactivated successfully',
        data: tariff
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/v1/tariffs/calculate-bill
   * Calculate bill with active tariff (MOST COMMONLY USED)
   */
  async calculateBillActive(req, res) {
    try {
      const { consumption } = req.body;
      
      if (consumption === undefined || typeof consumption !== 'number' || consumption < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid consumption value (non-negative number) is required'
        });
      }
      
      const bill = await tariffService.calculateBillWithActiveTariff(consumption);
      
      res.status(200).json({
        success: true,
        data: {
          consumption,
          bill
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/v1/tariffs/:id/calculate-bill
   * Calculate bill for specific tariff
   */
  async calculateBill(req, res) {
    try {
      const { id } = req.params;
      const { consumption } = req.body;
      
      if (consumption === undefined || typeof consumption !== 'number' || consumption < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid consumption value (non-negative number) is required'
        });
      }
      
      const bill = await tariffService.calculateBill(id, consumption);
      
      res.status(200).json({
        success: true,
        data: {
          tariffId: id,
          consumption,
          bill
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/v1/tariffs/compare
   * Compare bills across different consumption levels
   */
  async compareScenarios(req, res) {
    try {
      const { tariffId, consumptionLevels } = req.body;
      
      if (!tariffId) {
        return res.status(400).json({
          success: false,
          message: 'tariffId is required'
        });
      }

      if (!Array.isArray(consumptionLevels) || consumptionLevels.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'consumptionLevels array is required'
        });
      }
      
      const scenarios = await tariffService.compareConsumptionScenarios(
        tariffId, 
        consumptionLevels
      );
      
      res.status(200).json({
        success: true,
        data: {
          tariffId,
          scenarios
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/tariffs/search/:searchTerm
   * Search tariffs
   */
  async searchTariffs(req, res) {
    try {
      const { searchTerm } = req.params;
      
      const tariffs = await tariffService.searchTariffs(searchTerm);
      
      res.status(200).json({
        success: true,
        data: tariffs,
        count: tariffs.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/tariffs/:id/history
   * Get tariff history/versions
   */
  async getTariffHistory(req, res) {
    try {
      const { id } = req.params;
      const tariff = await tariffService.getTariffById(id);
      
      const history = await tariffService.getTariffHistory(tariff.name);
      
      res.status(200).json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/tariffs/:id/export
   * Export tariff as JSON file
   */
  async exportTariff(req, res) {
    try {
      const { id } = req.params;
      const tariff = await tariffService.exportTariff(id);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="tariff-${tariff.name}-${new Date().getTime()}.json"`
      );
      
      res.status(200).json(tariff);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TariffController();