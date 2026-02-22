const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariffController');

// Middleware (uncomment as you set them up)
// const { authMiddleware } = require('../middleware/auth');
// const { adminOnly } = require('../middleware/adminOnly');

/**
 * DOMESTIC TARIFF ROUTES
 * Base path: /api/v1/tariffs
 */

// ===== PUBLIC ROUTES (Authentication Required) =====

/**
 * GET /api/v1/tariffs
 * Get all tariff plans
 */
router.get('/', 
  // authMiddleware,
  tariffController.getAllTariffs
);

/**
 * GET /api/v1/tariffs/active
 * Get currently active domestic tariff
 */
router.get('/active',
  // authMiddleware,
  tariffController.getActiveTariff
);

/**
 * GET /api/v1/tariffs/:id
 * Get specific tariff by ID
 */
router.get('/:id',
  // authMiddleware,
  tariffController.getTariffById
);

/**
 * POST /api/v1/tariffs/calculate-bill
 * Calculate bill using active tariff (MOST COMMONLY USED)
 * Body: { consumption: number }
 */
router.post('/calculate-bill',
  // authMiddleware,
  tariffController.calculateBillActive
);

/**
 * POST /api/v1/tariffs/compare
 * Compare bills across different consumption levels
 * Body: { tariffId: string, consumptionLevels: [number] }
 */
router.post('/compare',
  // authMiddleware,
  tariffController.compareScenarios
);

/**
 * GET /api/v1/tariffs/search/:searchTerm
 * Search tariffs by name
 */
router.get('/search/:searchTerm',
  // authMiddleware,
  tariffController.searchTariffs
);

// ===== PROTECTED ROUTES (Admin Only) =====

/**
 * POST /api/v1/tariffs
 * Create new tariff plan
 */
router.post('/',
  // authMiddleware,
  // adminOnly,
  tariffController.createTariff
);

/**
 * PUT /api/v1/tariffs/:id
 * Update tariff plan
 */
router.put('/:id',
  // authMiddleware,
  // adminOnly,
  tariffController.updateTariff
);

/**
 * DELETE /api/v1/tariffs/:id
 * Deactivate tariff plan
 */
router.delete('/:id',
  // authMiddleware,
  // adminOnly,
  tariffController.deleteTariff
);

/**
 * POST /api/v1/tariffs/:id/calculate-bill
 * Calculate bill for specific tariff
 * Body: { consumption: number }
 */
router.post('/:id/calculate-bill',
  // authMiddleware,
  tariffController.calculateBill
);

/**
 * GET /api/v1/tariffs/:id/history
 * Get tariff history/versions
 */
router.get('/:id/history',
  // authMiddleware,
  tariffController.getTariffHistory
);

/**
 * GET /api/v1/tariffs/:id/export
 * Export tariff as JSON file
 */
router.get('/:id/export',
  // authMiddleware,
  // adminOnly,
  tariffController.exportTariff
);

module.exports = router;