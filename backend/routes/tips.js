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

router.post('/:tipId/bookmark', protect, tipsController.bookmarkTip);
router.post('/:tipId/unbookmark', protect, tipsController.unbookmarkTip);

router.post('/:tipId/implement', protect, tipsController.implementTip);

router.post('/:tipId/feedback', protect, validate(interactionFeedbackSchema), tipsController.feedbackTip);

router.post('/:tipId/dismiss', protect, validate(dismissSchema), tipsController.dismissTip);

module.exports = router;
