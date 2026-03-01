const BudgetPlan = require('../models/budgetPlan');
const TariffPlan = require('../models/TariffPlan');

class budgetService {
  //new budget
  async createBudget(budgetData, userId) {
    try {
      // Validate required fields
      if (!budgetData.householdId || !budgetData.monthlyLimit) {
        throw new Error('Household ID and monthly limit are required');
      }

      if (budgetData.monthlyLimit <= 0) {
        throw new Error('Monthly limit must be greater than 0');
      }

      // Set user ID
      budgetData.userId = userId;
      budgetData.createdBy = userId;
      budgetData.lastModifiedBy = userId;

      // Get current tariff
      const tariff = await TariffPlan.getActiveTariff();
      if (tariff) {
        budgetData.tariffId = tariff._id;
      }

      // Set end date if not provided
      if (!budgetData.endDate && budgetData.startDate) {
        const endDate = new Date(budgetData.startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of month
        budgetData.endDate = endDate;
      }

      const budget = new BudgetPlan(budgetData);
      await budget.save();

      return budget;
    } catch (error) {
      throw new Error(`Failed to create budget: ${error.message}`);
    }
  }

  //all budgets
  async getAllBudgets(filters = {}) {
    try {
      const query = { isActive: true };

      if (filters.householdId) {
        query.householdId = filters.householdId;
      }

      if (filters.userId) {
        query.userId = filters.userId;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      return await BudgetPlan.find(query)
        .populate('householdId', 'name')
        .populate('userId', 'email name')
        .populate('tariffId', 'name')
        .sort({ startDate: -1 })
        .select('-__v');
    } catch (error) {
      throw new Error(`Failed to get budgets: ${error.message}`);
    }
  }

  //budget by ID
  async getBudgetById(budgetId) {
    try {
      const budget = await BudgetPlan.findById(budgetId)
        .populate('householdId', 'name')
        .populate('userId', 'email name')
        .populate('tariffId', 'name');

      if (!budget) {
        throw new Error('Budget not found');
      }

      return budget;
    } catch (error) {
      throw new Error(`Failed to get budget: ${error.message}`);
    }
  }

  //active budget for household
  async getActiveBudget(householdId) {
    try {
      const budget = await BudgetPlan.getActiveBudget(householdId)
        .populate('householdId', 'name')
        .populate('userId', 'email name')
        .populate('tariffId', 'name');

      if (!budget) {
        throw new Error('No active budget found for this household');
      }

      return budget;
    } catch (error) {
      throw new Error(`Failed to get active budget: ${error.message}`);
    }
  }

  //month budget
  async getCurrentMonthBudget(householdId) {
    try {
      const budget = await BudgetPlan.getCurrentMonthBudget(householdId)
        .populate('householdId', 'name')
        .populate('userId', 'email name')
        .populate('tariffId', 'name');

      if (!budget) {
        throw new Error('No budget found for current month');
      }

      return budget;
    } catch (error) {
      throw new Error(`Failed to get current month budget: ${error.message}`);
    }
  }

  //Update budget
  async updateBudget(budgetId, updateData, userId) {
    try {
      const budget = await BudgetPlan.findById(budgetId);

      if (!budget) {
        throw new Error('Budget not found');
      }

      // Prevent changing certain fields
      delete updateData.householdId;
      delete updateData.userId;
      delete updateData.createdBy;
      delete updateData.startDate;

      // Validate monthly limit if updating
      if (updateData.monthlyLimit && updateData.monthlyLimit <= 0) {
        throw new Error('Monthly limit must be greater than 0');
      }

      // Update fields
      Object.assign(budget, updateData);
      budget.lastModifiedBy = userId;

      await budget.save();

      return budget;
    } catch (error) {
      throw new Error(`Failed to update budget: ${error.message}`);
    }
  }

  //Update consumption and calculate bill
  async updateConsumption(budgetId, consumption) {
    try {
      if (typeof consumption !== 'number' || consumption < 0) {
        throw new Error('Consumption must be a non-negative number');
      }

      const budget = await BudgetPlan.findById(budgetId);

      if (!budget) {
        throw new Error('Budget not found');
      }

      // Get tariff
      const tariff = budget.tariffId
        ? await TariffPlan.findById(budget.tariffId)
        : await TariffPlan.getActiveTariff();

      if (!tariff) {
        throw new Error('No tariff found to calculate bill');
      }

      // Update consumption and bill
      budget.updateConsumption(consumption, tariff);

      // Check if alert should be triggered
      if (budget.shouldTriggerAlert()) {
        const percentage = budget.getBudgetPercentage();
        budget.addAlert(
          'threshold',
          `Budget usage at ${percentage}% of monthly limit`,
          percentage > 100 ? 'high' : percentage > 90 ? 'medium' : 'low'
        );
      }

      // Calculate projected bill
      budget.calculateProjectedBill(tariff);

      await budget.save();

      return budget;
    } catch (error) {
      throw new Error(`Failed to update consumption: ${error.message}`);
    }
  }

  //get budget progress
  async getBudgetProgress(budgetId) {
    try {
      const budget = await BudgetPlan.findById(budgetId)
        .populate('tariffId', 'name');

      if (!budget) {
        throw new Error('Budget not found');
      }

      // Calculate projected consumption if needed
      budget.calculateProjectedConsumption();
      budget.calculateProjectedBill(await TariffPlan.findById(budget.tariffId));

      return {
        budgetId: budget._id,
        summary: budget.getSummary(),
        daysRemaining: budget.getDaysRemaining(),
        projection: {
          consumption: budget.projectedConsumption,
          bill: budget.projectedBill,
          willExceed: budget.projectedBill > budget.monthlyLimit
        },
        recentAlerts: budget.alerts.slice(-5).reverse()
      };
    } catch (error) {
      throw new Error(`Failed to get budget progress: ${error.message}`);
    }
  }

  async deactivateBudget(budgetId, userId) {
    try {
      const budget = await BudgetPlan.findByIdAndUpdate(
        budgetId,
        {
          isActive: false,
          status: 'completed',
          lastModifiedBy: userId
        },
        { new: true }
      );

      if (!budget) {
        throw new Error('Budget not found');
      }

      return budget;
    } catch (error) {
      throw new Error(`Failed to deactivate budget: ${error.message}`);
    }
  }

  async compareBudgetVsActual(budgetId) {
    try {
      const budget = await BudgetPlan.findById(budgetId)
        .populate('tariffId');

      if (!budget) {
        throw new Error('Budget not found');
      }

      const tariff = budget.tariffId || await TariffPlan.getActiveTariff();

      return {
        budgetId: budget._id,
        period: {
          start: budget.startDate,
          end: budget.endDate,
          daysElapsed: Math.ceil((new Date() - budget.startDate) / (1000 * 60 * 60 * 24)),
          totalDays: Math.ceil((budget.endDate - budget.startDate) / (1000 * 60 * 60 * 24))
        },
        budget: {
          limit: budget.monthlyLimit,
          spent: budget.currentBill,
          remaining: budget.getRemainingBudget(),
          percentageUsed: budget.getBudgetPercentage()
        },
        consumption: {
          actual: budget.actualConsumption,
          projected: budget.projectedConsumption,
          tariff: tariff ? tariff.name : 'Unknown'
        },
        comparison: {
          overBudget: budget.isExceeded(),
          excessAmount: Math.max(0, budget.currentBill - budget.monthlyLimit),
          projectionExceeds: budget.projectedBill > budget.monthlyLimit,
          projectedExcessAmount: Math.max(0, budget.projectedBill - budget.monthlyLimit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to compare budget vs actual: ${error.message}`);
    }
  }

  async getBudgetsInRange(householdId, startDate, endDate) {
    try {
      if (!householdId || !startDate || !endDate) {
        throw new Error('Household ID, start date, and end date are required');
      }

      return await BudgetPlan.getBudgetsInRange(householdId, startDate, endDate)
        .populate('tariffId', 'name')
        .select('-__v');
    } catch (error) {
      throw new Error(`Failed to get budgets in range: ${error.message}`);
    }
  }

  async getBudgetAlerts(budgetId) {
    try {
      const budget = await BudgetPlan.findById(budgetId);

      if (!budget) {
        throw new Error('Budget not found');
      }

      return {
        budgetId: budget._id,
        totalAlerts: budget.alerts.length,
        unreadAlerts: budget.getUnreadAlertsCount(),
        alerts: budget.alerts.sort((a, b) => b.triggeredAt - a.triggeredAt)
      };
    } catch (error) {
      throw new Error(`Failed to get budget alerts: ${error.message}`);
    }
  }

  async markAlertAsRead(budgetId, alertIndex) {
    try {
      const budget = await BudgetPlan.findById(budgetId);

      if (!budget) {
        throw new Error('Budget not found');
      }

      if (!budget.markAlertAsRead(alertIndex)) {
        throw new Error('Alert not found');
      }

      await budget.save();

      return budget;
    } catch (error) {
      throw new Error(`Failed to mark alert as read: ${error.message}`);
    }
  }

  async getExceededBudgets() {
    try {
      return await BudgetPlan.find({
        status: 'exceeded',
        isActive: true
      })
        .populate('householdId', 'name')
        .populate('userId', 'email name')
        .sort({ updatedAt: -1 });
    } catch (error) {
      throw new Error(`Failed to get exceeded budgets: ${error.message}`);
    }
  }

  async forecastNextMonthBudget(budgetId) {
    try {
      const currentBudget = await BudgetPlan.findById(budgetId)
        .populate('tariffId');

      if (!currentBudget) {
        throw new Error('Budget not found');
      }

      // Calculate projected bill
      currentBudget.calculateProjectedBill(currentBudget.tariffId);

      // Create forecast for next month
      const nextMonthStart = new Date(currentBudget.endDate);
      nextMonthStart.setDate(nextMonthStart.getDate() + 1);

      const nextMonthEnd = new Date(nextMonthStart);
      nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 1);
      nextMonthEnd.setDate(0);

      return {
        currentMonth: {
          period: `${currentBudget.startDate.toISOString().split('T')[0]} to ${currentBudget.endDate.toISOString().split('T')[0]}`,
          projectedBill: currentBudget.projectedBill,
          projectedConsumption: currentBudget.projectedConsumption
        },
        nextMonthForecast: {
          period: `${nextMonthStart.toISOString().split('T')[0]} to ${nextMonthEnd.toISOString().split('T')[0]}`,
          recommendedBudget: Math.ceil(currentBudget.projectedBill * 1.1), // 10% buffer
          projectedBill: currentBudget.projectedBill,
          projectedConsumption: currentBudget.projectedConsumption,
          tariff: currentBudget.tariffId ? currentBudget.tariffId.name : 'Unknown'
        }
      };
    } catch (error) {
      throw new Error(`Failed to forecast next month budget: ${error.message}`);
    }
  }
}

module.exports = new budgetService();