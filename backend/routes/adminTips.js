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

/**
 * @swagger
 * /api/v1/admin-tips:
 *   get:
 *     summary: Get all energy tips for admin management
 *     tags: [Admin Tips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Tip list retrieved successfully
 */
router.get('/', protect, adminRole, adminTipsController.listTips);

/**
 * @swagger
 * /api/v1/admin-tips:
 *   post:
 *     summary: Create a new energy tip
 *     tags: [Admin Tips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category, effortLevel, savingsModel]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Set AC temperature to 26°C
 *               description:
 *                 type: string
 *                 example: Increasing AC temperature slightly can reduce electricity use.
 *               category:
 *                 type: string
 *                 example: Cooling
 *               requiredApplianceKeywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [ac, air conditioner]
 *               requiredCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Cooling]
 *               incomeTags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [LOW, MID, HIGH, ALL]
 *               weatherTags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [HOT, ALL]
 *               effortLevel:
 *                 type: string
 *                 enum: [ZERO_COST, LOW_COST, INVESTMENT]
 *                 example: ZERO_COST
 *               savingsModel:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: PERCENT_OF_CATEGORY
 *                   percent:
 *                     type: number
 *                     example: 8
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Tip created successfully
 */
router.post('/', protect, adminRole, validate(createTipSchema), adminTipsController.createTip);

/**
 * @swagger
 * /api/v1/admin-tips/{tipId}:
 *   patch:
 *     summary: Update an existing energy tip
 *     tags: [Admin Tips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipId
 *         required: true
 *         schema:
 *           type: string
 *         description: Energy tip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tip updated successfully
 *       404:
 *         description: Tip not found
 */
router.patch('/:tipId', protect, adminRole, validateUpdate(createTipSchema), adminTipsController.updateTip);

/**
 * @swagger
 * /api/v1/admin-tips/{tipId}:
 *   delete:
 *     summary: Deactivate an energy tip
 *     tags: [Admin Tips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipId
 *         required: true
 *         schema:
 *           type: string
 *         description: Energy tip ID
 *     responses:
 *       200:
 *         description: Tip deactivated successfully
 *       404:
 *         description: Tip not found
 */
router.delete('/:tipId', protect, adminRole, adminTipsController.deactivateTip);

module.exports = router;
