const express = require('express');
const router = express.Router();
const budgetController = require('./controllers/budgetController');

// Middleware (uncomment as you set them up)
// const { authMiddleware } = require('../middleware/auth');
// const { householdOwnerCheck } = require('../middleware/householdCheck');

/**
 * BUDGET ROUTES
 * Base path: /api/v1/budgets
 */

// ===== USER ROUTES =====

/**
 * POST /api/v1/budgets
 * Create new budget
 * Body: { householdId, monthlyLimit, alertThresholds?, notes? }
 */
router.post('/',
  // authMiddleware,
  // householdOwnerCheck,
  budgetController.createBudget
);

/**
 * GET /api/v1/budgets
 * Get all budgets (with optional filters)
 * Query: ?householdId=xxx&status=active&userId=xxx
 */
router.get('/',
  // authMiddleware,
  budgetController.getAllBudgets
);

/**
 * GET /api/v1/budgets/:id
 * Get specific budget
 */
router.get('/:id',
  // authMiddleware,
  budgetController.getBudgetById
);

/**
 * GET /api/v1/budgets/household/:householdId/active
 * Get active budget for household
 */
router.get('/household/:householdId/active',
  // authMiddleware,
  budgetController.getActiveBudget
);

/**
 * GET /api/v1/budgets/household/:householdId/current
 * Get current month budget
 */
router.get('/household/:householdId/current',
  // authMiddleware,
  budgetController.getCurrentMonthBudget
);

/**
 * PUT /api/v1/budgets/:id
 * Update budget
 * Body: { monthlyLimit?, alertThresholds?, status?, notes? }
 */
router.put('/:id',
  // authMiddleware,
  // householdOwnerCheck,
  budgetController.updateBudget
);

/**
 * POST /api/v1/budgets/:id/consumption
 * Update consumption and calculate bill
 * Body: { consumption: number }
 */
router.post('/:id/consumption',
  // authMiddleware,
  budgetController.updateConsumption
);

/**
 * GET /api/v1/budgets/:id/progress
 * Get budget progress and projections
 */
router.get('/:id/progress',
  // authMiddleware,
  budgetController.getBudgetProgress
);

/**
 * GET /api/v1/budgets/:id/compare
 * Compare budget vs actual spending
 */
router.get('/:id/compare',
  // authMiddleware,
  budgetController.compareBudgetVsActual
);

/**
 * GET /api/v1/budgets/:id/alerts
 * Get all alerts for a budget
 */
router.get('/:id/alerts',
  // authMiddleware,
  budgetController.getBudgetAlerts
);

/**
 * PUT /api/v1/budgets/:id/alerts/:alertIndex/read
 * Mark specific alert as read
 */
router.put('/:id/alerts/:alertIndex/read',
  // authMiddleware,
  budgetController.markAlertAsRead
);

/**
 * GET /api/v1/budgets/household/:householdId/range
 * Get budgets in date range
 * Query: ?startDate=2025-01-01&endDate=2025-12-31
 */
router.get('/household/:householdId/range',
  // authMiddleware,
  budgetController.getBudgetsInRange
);

/**
 * GET /api/v1/budgets/:id/forecast
 * Get next month budget forecast
 */
router.get('/:id/forecast',
  // authMiddleware,
  budgetController.forecastNextMonthBudget
);

/**
 * DELETE /api/v1/budgets/:id
 * Deactivate budget
 */
router.delete('/:id',
  // authMiddleware,
  // householdOwnerCheck,
  budgetController.deactivateBudget
);

// ===== ADMIN ROUTES =====

/**
 * GET /api/v1/budgets/admin/exceeded
 * Get all exceeded budgets (admin only)
 */
router.get('/admin/exceeded',
  // authMiddleware,
  // adminOnly,
  budgetController.getExceededBudgets
);

module.exports = router;