const express = require('express');
const router = express.Router();
const billPredictionController = require('../controllers/billPredictionController');

//middleware
const { authMiddleware } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.post('/',
  // authMiddleware,
  billPredictionController.createPrediction
);

router.get('/latest/:householdId',
  // authMiddleware,
  billPredictionController.getLatestPrediction
);

router.get('/:householdId/month-end',
  // authMiddleware,
  billPredictionController.getMonthEndForecast
);

router.post('/:householdId/forecast',
  // authMiddleware,
  billPredictionController.getDetailedForecast
);

router.get('/period/:householdId',
  // authMiddleware,
  billPredictionController.getPredictionByPeriod
);

router.get('/history/:householdId',
  // authMiddleware,
  billPredictionController.getPredictionHistory
);


router.get('/:id',
  // authMiddleware,
  billPredictionController.getPredictionById
);


router.get('/:id/summary',
  billPredictionController.getPredictionSummary
);


router.post('/:id/compare',
  billPredictionController.comparePredictionWithActual
);

router.put('/:id/status',
  billPredictionController.updatePredictionStatus
);


router.delete('/:householdId/old',
  billPredictionController.deleteOldPredictions
);

// ===== ADMIN ROUTES =====
router.get('/admin/at-risk',
  billPredictionController.getAtRiskPredictions
);

module.exports = router;