const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect: authMiddleware } = require('../middleware/auth');

router.get('/',
  authMiddleware,
  alertController.getAllAlerts
);

router.get('/unread-count',
  authMiddleware,
  alertController.getUnreadCount
);

router.get('/unread',
  authMiddleware,
  alertController.getUnreadAlerts
);

router.get('/critical',
  authMiddleware,
  alertController.getCriticalAlerts
);

router.get('/household/:householdId',
  authMiddleware,
  alertController.getHouseholdAlerts
);

router.get('/type/:type',
  authMiddleware,
  alertController.getAlertsByType
);

router.get('/range',
  authMiddleware,
  alertController.getAlertsInRange
);

router.get('/:id',
  authMiddleware,
  alertController.getAlertById
);

router.put('/:id/read',
  authMiddleware,
  alertController.markAsRead
);

router.put('/mark-all-read',
  authMiddleware,
  alertController.markAllAsRead
);

router.put('/:id/dismiss',
  authMiddleware,
  alertController.dismissAlert
);

router.put('/:id/resolve',
  authMiddleware,
  alertController.resolveAlert
);

router.delete('/:id',
  authMiddleware,
  alertController.deleteAlert
);

router.post('/re-scan',
  authMiddleware,
  alertController.reScan
);

router.post('/test-alert',
  authMiddleware,
  alertController.createTestAlert
);

router.delete('/',
  authMiddleware,
  alertController.deleteAll
);

module.exports = router;