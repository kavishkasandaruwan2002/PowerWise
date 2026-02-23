const express = require('express');
const router = express.Router();

const adminTipsController = require('../controllers/adminTipsController');
const { protect, authorize } = require('../middleware/auth');
const { validate, validateUpdate } = require('../middleware/validate');
const { createTipSchema } = require('../validators/tipValidator');

// Accept both "ADMIN" and "admin" because team code uses inconsistent casing.
const adminRole = (req, res, next) => authorize('ADMIN', 'admin')(req, res, next);

/**
 * @swagger
 * tags:
 *   name: Admin Tips
 *   description: Tip library management (admin)
 */

router.get('/', protect, adminRole, adminTipsController.listTips);
router.post('/', protect, adminRole, validate(createTipSchema), adminTipsController.createTip);
router.patch('/:tipId', protect, adminRole, validateUpdate(createTipSchema), adminTipsController.updateTip);
router.delete('/:tipId', protect, adminRole, adminTipsController.deactivateTip);

module.exports = router;
