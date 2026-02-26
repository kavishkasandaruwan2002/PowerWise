const express = require('express');
const router = express.Router();
const usageSpikeController = require('../controllers/usageSpikeController');

const { authMiddleware } = require('../middleware/auth');

router.post('/check-spike',
  authMiddleware,
  usageSpikeController.checkSpike
);

router.get('/anomalies/:householdId',
  authMiddleware,
  usageSpikeController.detectAnomalies
);

router.get('/spike-history/:householdId',
  authMiddleware,
  usageSpikeController.getSpikeHistory
);

router.post('/analyze-spike',
  authMiddleware,
  usageSpikeController.analyzeSpikeDetail
);

router.get('/compare/:householdId/:date',
  authMiddleware,
  usageSpikeController.compareWithAverage
);

router.get('/spike-causes/:householdId/:date',
  authMiddleware,
  usageSpikeController.identifySpikeCauses
);

module.exports = router;