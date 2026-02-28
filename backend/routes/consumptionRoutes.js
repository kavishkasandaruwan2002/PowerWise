const express = require('express');
const router = express.Router();
const consumptionController = require('../controllers/consumptioController');

router.post('/',
  consumptionController.recordConsumption
);

router.get('/',
  consumptionController.getConsumption
);

router.get('/range',
  consumptionController.getConsumptionInRange
);

router.get('/daily/:householdId/:date',
  consumptionController.getDailyConsumption
);

router.get('/last-days/:householdId',
  consumptionController.getLastNDays
);

router.get('/anomalies/:householdId',
  consumptionController.getAnomalies
);

router.get('/analytics/:householdId',
  consumptionController.getAnalytics
);

router.get('/average',
  consumptionController.getAverageConsumption
);

router.get('/trend/:householdId',
  consumptionController.getTrend
);

router.get('/weekly-summary/:householdId',
  consumptionController.getWeeklySummary
);

router.get('/monthly-summary/:householdId',
  consumptionController.getMonthlySummary
);

router.post('/compare',
  consumptionController.compareConsumption
);

router.post('/check-anomaly',
  consumptionController.checkAnomaly
);

router.post('/bulk-import',
  consumptionController.bulkImportConsumption
);

router.put('/:id',
  consumptionController.updateConsumption
);

router.put('/:id/verify',
  consumptionController.verifyConsumption
);

router.delete('/:id',
  consumptionController.deleteConsumption
);

module.exports = router;