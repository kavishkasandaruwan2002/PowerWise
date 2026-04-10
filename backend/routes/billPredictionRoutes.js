const express = require('express');
const router = express.Router();
const billPredictionController = require('../controllers/billPredictionController');

//middleware
const { protect: authMiddleware, adminOnly } = require('../middleware/auth');

router.post('/',
  authMiddleware,
  billPredictionController.createPrediction
);

router.get('/latest/:householdId',
  authMiddleware,
  billPredictionController.getLatestPrediction
);

router.get('/:householdId/month-end',
  authMiddleware,
  billPredictionController.getMonthEndForecast
);

router.post('/:householdId/forecast',
  authMiddleware,
  billPredictionController.getDetailedForecast
);

router.get('/period/:householdId',
  authMiddleware,
  billPredictionController.getPredictionByPeriod
);

router.get('/history/:householdId',
  authMiddleware,
  billPredictionController.getPredictionHistory
);


router.get('/:id',
  authMiddleware,
  billPredictionController.getPredictionById
);


router.get('/:id/summary',
  authMiddleware,
  billPredictionController.getPredictionSummary
);


router.post('/:id/compare',
  authMiddleware,
  billPredictionController.comparePredictionWithActual
);

router.put('/:id/status',
  authMiddleware,
  billPredictionController.updatePredictionStatus
);


router.delete('/:householdId/old',
  authMiddleware,
  adminOnly,
  billPredictionController.deleteOldPredictions
);

// ===== ADMIN ROUTES =====
router.get('/admin/at-risk',  
  authMiddleware,
  adminOnly,
  billPredictionController.getAtRiskPredictions
);

module.exports = router;