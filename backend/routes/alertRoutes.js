const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authMiddleware } = require('../middleware/auth');

router.get('/',
  alertController.getAllAlerts
);

router.get('/unread-count',
  alertController.getUnreadCount
);

router.get('/unread',
  alertController.getUnreadAlerts
);

router.get('/critical',
  alertController.getCriticalAlerts
);

router.get('/household/:householdId',
  alertController.getHouseholdAlerts
);

router.get('/type/:type',
  alertController.getAlertsByType
);

router.get('/range',
  alertController.getAlertsInRange
);

router.get('/:id',
  alertController.getAlertById
);

router.put('/:id/read',
  alertController.markAsRead
);

router.put('/mark-all-read',
  alertController.markAllAsRead
);

router.put('/:id/dismiss',
  alertController.dismissAlert
);

router.put('/:id/resolve',
  alertController.resolveAlert
);

router.delete('/:id',
  alertController.deleteAlert
);

module.exports = router;