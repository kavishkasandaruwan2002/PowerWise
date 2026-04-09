const express = require('express');
const router = express.Router();

const tipsController = require('../controllers/tipsController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { interactionFeedbackSchema, dismissSchema } = require('../validators/tipValidator');

/**
 * @swagger
 * tags:
 *   name: Tips
 *   description: Personalized energy tips
 */

/**
 * @swagger
 * /api/v1/tips/recommendations:
 *   get:
 *     summary: Get personalized energy tips (LOW income, profile location)
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: number }
 *         description: Number of tips to return (default 5)
 *     responses:
 *       200:
 *         description: Recommendations (weather fetched every request; lat/lon from user profile)
 */
router.get('/recommendations', protect, tipsController.getRecommendations);

/**
 * @swagger
 * /api/v1/tips/all:
 *   get:
 *     summary: Get all active tips for users excluding currently dismissed tips
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All active user tips retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 8
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tip:
 *                         $ref: '#/components/schemas/EnergyTip'
 *                       interaction:
 *                         type: object
 *                         properties:
 *                           bookmarked:
 *                             type: boolean
 *                             example: false
 *                           implemented:
 *                             type: boolean
 *                             example: false
 *                           feedback:
 *                             type: string
 *                             nullable: true
 *                             enum: [HELPFUL, NEUTRAL, NOT_HELPFUL, null]
 *                             example: null
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/all', protect, tipsController.getAllVisibleTips);

/**
 * @swagger
 * /api/v1/tips/interactions:
 *   get:
 *     summary: Get my tip interactions
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interaction list
 */
router.get('/interactions', protect, tipsController.getMyInteractions);

/**
 * @swagger
 * /api/v1/tips/{tipId}/bookmark:
 *   post:
 *     summary: Bookmark a tip
 *     tags: [Tips]
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
 *         description: Tip bookmarked successfully
 *       404:
 *         description: Tip not found
 */
router.post('/:tipId/bookmark', protect, tipsController.bookmarkTip)

/**
 * @swagger
 * /api/v1/tips/{tipId}/unbookmark:
 *   post:
 *     summary: Remove bookmark from a tip
 *     tags: [Tips]
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
 *         description: Tip unbookmarked successfully
 *       404:
 *         description: Tip not found
 */;
router.post('/:tipId/unbookmark', protect, tipsController.unbookmarkTip);

/**
 * @swagger
 * /api/v1/tips/{tipId}/implement:
 *   post:
 *     summary: Mark a tip as implemented
 *     tags: [Tips]
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
 *         description: Tip marked as implemented
 *       404:
 *         description: Tip not found
 */
router.post('/:tipId/implement', protect, tipsController.implementTip);

/**
 * @swagger
 * /api/v1/tips/{tipId}/feedback:
 *   post:
 *     summary: Submit feedback for a tip
 *     tags: [Tips]
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
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: string
 *                 enum: [HELPFUL, NEUTRAL, NOT_HELPFUL]
 *                 example: HELPFUL
 *               comment:
 *                 type: string
 *                 example: This tip is useful for my home
 *     responses:
 *       200:
 *         description: Feedback saved successfully
 *       404:
 *         description: Tip not found
 */
router.post('/:tipId/feedback', protect, validate(interactionFeedbackSchema), tipsController.feedbackTip);

/**
 * @swagger
 * /api/v1/tips/{tipId}/dismiss:
 *   post:
 *     summary: Dismiss a tip for a number of days
 *     tags: [Tips]
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 example: 14
 *     responses:
 *       200:
 *         description: Tip dismissed successfully
 *       404:
 *         description: Tip not found
 */
router.post('/:tipId/dismiss', protect, validate(dismissSchema), tipsController.dismissTip);

module.exports = router;
