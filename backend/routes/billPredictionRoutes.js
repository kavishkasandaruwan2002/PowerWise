const express = require('express');
const router = express.Router();
const billPredictionController = require('../controllers/billPredictionController');

const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.post('/',
  protect,
  billPredictionController.createPrediction
);

router.get('/latest/:householdId',
  protect,
  billPredictionController.getLatestPrediction
);

router.get('/:householdId/month-end',
  protect,
  billPredictionController.getMonthEndForecast
);

router.post('/:householdId/forecast',
  protect,
  billPredictionController.getDetailedForecast
);

router.get('/period/:householdId',
  protect,
  billPredictionController.getPredictionByPeriod
);

router.get('/history/:householdId',
  protect,
  billPredictionController.getPredictionHistory
);

router.get('/:id',
  protect,
  billPredictionController.getPredictionById
);

router.get('/:id/summary',
  protect,
  billPredictionController.getPredictionSummary
);

router.post('/:id/compare',
  protect,
  billPredictionController.comparePredictionWithActual
);

router.put('/:id/status',
  protect,
  billPredictionController.updatePredictionStatus
);

router.delete('/:householdId/old',
  protect,
  billPredictionController.deleteOldPredictions
);

router.get('/admin/at-risk',
  protect,
  adminOnly,
  billPredictionController.getAtRiskPredictions
);

module.exports = router;