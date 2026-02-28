const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

const { authMiddleware } = require('../middleware/auth');
const { householdOwnerCheck } = require('../middleware/householdCheck');


// ===== USER ROUTES =====

router.post('/',
  authMiddleware,
  householdOwnerCheck,
  budgetController.createBudget
);

router.get('/',
  authMiddleware,
  budgetController.getAllBudgets
);

router.get('/:id',
  authMiddleware,
  budgetController.getBudgetById
);

router.get('/household/:householdId/active',
  authMiddleware,
  budgetController.getActiveBudget
);

router.get('/household/:householdId/current',
  authMiddleware,
  budgetController.getCurrentMonthBudget
);

router.put('/:id',
  authMiddleware,
  householdOwnerCheck,
  budgetController.updateBudget
);

router.post('/:id/consumption',
  authMiddleware,
  budgetController.updateConsumption
);

router.get('/:id/progress',
  authMiddleware,
  budgetController.getBudgetProgress
);

router.get('/:id/compare',
  authMiddleware,
  budgetController.compareBudgetVsActual
);

router.get('/:id/alerts',
  authMiddleware,
  budgetController.getBudgetAlerts
);

router.put('/:id/alerts/:alertIndex/read',
  authMiddleware,
  budgetController.markAlertAsRead
);

router.get('/household/:householdId/range',
  authMiddleware,
  budgetController.getBudgetsInRange
);

router.get('/:id/forecast',
  authMiddleware,
  budgetController.forecastNextMonthBudget
);

router.delete('/:id',
  authMiddleware,
  householdOwnerCheck,
  budgetController.deactivateBudget
);

// ==================== ADMIN ROUTES =====

router.get('/admin/exceeded',
  authMiddleware,
  adminOnly,
  budgetController.getExceededBudgets
);

module.exports = router;