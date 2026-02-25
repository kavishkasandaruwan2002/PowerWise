const budgetService = require('./services/budgetService');
const { validateCreateBudget, validateUpdateBudget } = require('../validators/budgetValidator');

class BudgetController {
  /**
   * POST /api/v1/budgets
   * Create new budget
   */
  async createBudget(req, res) {
    try {
      const { error, value } = validateCreateBudget(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const budget = await budgetService.createBudget(value, req.user._id);

      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/budgets
   * Get all budgets (with filters)
   */
  async getAllBudgets(req, res) {
    try {
      const { householdId, userId, status } = req.query;

      const filters = {};
      if (householdId) filters.householdId = householdId;
      if (userId) filters.userId = userId;
      if (status) filters.status = status;

      const budgets = await budgetService.getAllBudgets(filters);

      res.status(200).json({
        success: true,
        data: budgets,
        count: budgets.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/budgets/:id
   * Get specific budget by ID
   */
  async getBudgetById(req, res) {
    try {
      const { id } = req.params;
      const budget = await budgetService.getBudgetById(id);

      res.status(200).json({
        success: true,
        data: budget
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/budgets/household/:householdId/active
   * Get active budget for household
   */
  async getActiveBudget(req, res) {
    try {
      const { householdId } = req.params;
      const budget = await budgetService.getActiveBudget(householdId);

      res.status(200).json({
        success: true,
        data: budget
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/budgets/household/:householdId/current
   * Get current month budget
   */
  async getCurrentMonthBudget(req, res) {
    try {
      const { householdId } = req.params;
      const budget = await budgetService.getCurrentMonthBudget(householdId);

      res.status(200).json({
        success: true,
        data: budget
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/v1/budgets/:id
   * Update budget
   */
  async updateBudget(req, res) {
    try {
      const { id } = req.params;

      const { error, value } = validateUpdateBudget(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const budget = await budgetService.updateBudget(id, value, req.user._id);

      res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        data: budget
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/v1/budgets/:id/consumption
   * Update consumption and calculate bill
   */
  async updateConsumption(req, res) {
    try {
      const { id } = req.params;
      const { consumption } = req.body;

      if (consumption === undefined || typeof consumption !== 'number' || consumption < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid consumption value (non-negative number) is required'
        });
      }

      const budget = await budgetService.updateConsumption(id, consumption);

      res.status(200).json({
        success: true,
        message: 'Consumption updated successfully',
        data: budget
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/budgets/:id/progress
   * Get budget progress and projections
   */
  async getBudgetProgress(req, res) {
    try {
      const { id } = req.params;
      const progress = await budgetService.getBudgetProgress(id);

      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/budgets/:id/compare
   * Compare budget vs actual
   */
  async compareBudgetVsActual(req, res) {
    try {
      const { id } = req.params;
      const comparison = await budgetService.compareBudgetVsActual(id);

      res.status(200).json({
        success: true,
        data: comparison
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/v1/budgets/:id
   * Deactivate budget
   */
  async deactivateBudget(req, res) {
    try {
      const { id } = req.params;
      const budget = await budgetService.deactivateBudget(id, req.user._id);

      res.status(200).json({
        success: true,
        message: 'Budget deactivated successfully',
        data: budget
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/budgets/:id/alerts
   * Get all alerts for a budget
   */
  async getBudgetAlerts(req, res) {
    try {
      const { id } = req.params;
      const alerts = await budgetService.getBudgetAlerts(id);

      res.status(200).json({
        success: true,
        data: alerts
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/v1/budgets/:id/alerts/:alertIndex/read
   * Mark alert as read
   */
  async markAlertAsRead(req, res) {
    try {
      const { id, alertIndex } = req.params;
      const budget = await budgetService.markAlertAsRead(id, parseInt(alertIndex));

      res.status(200).json({
        success: true,
        message: 'Alert marked as read',
        data: budget
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/budgets/household/:householdId/range
   * Get budgets in date range
   */
  async getBudgetsInRange(req, res) {
    try {
      const { householdId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date query parameters are required'
        });
      }

      const budgets = await budgetService.getBudgetsInRange(
        householdId,
        new Date(startDate),
        new Date(endDate)
      );

      res.status(200).json({
        success: true,
        data: budgets,
        count: budgets.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/budgets/exceeded
   * Get all exceeded budgets
   */
  async getExceededBudgets(req, res) {
    try {
      const budgets = await budgetService.getExceededBudgets();

      res.status(200).json({
        success: true,
        data: budgets,
        count: budgets.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/budgets/:id/forecast
   * Get next month budget forecast
   */
  async forecastNextMonthBudget(req, res) {
    try {
      const { id } = req.params;
      const forecast = await budgetService.forecastNextMonthBudget(id);

      res.status(200).json({
        success: true,
        data: forecast
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new BudgetController();