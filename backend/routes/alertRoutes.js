const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect: authMiddleware } = require('../middleware/auth');
const alertService = require('../services/alertService'); // add this

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

router.put('/mark-all-read',
  authMiddleware,
  alertController.markAllAsRead
);

router.put('/:id/read',
  authMiddleware,
  alertController.markAsRead
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

/*
// TEMPORARY TEST ROUTE - remove after testing
router.post('/test-seed',
  authMiddleware,
  async (req, res) => {
    try {
      const alert = await alertService.createAlert({
        householdId: req.body.householdId,
        userId: req.user._id,
        type: 'budget_threshold',
        severity: 'warning',
        sourceModule: 'budget',
        title: 'Test Budget Alert',
        message: 'You have used 85% of your monthly budget.'
      });
      res.status(201).json({ success: true, data: alert });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);
*/
module.exports = router;