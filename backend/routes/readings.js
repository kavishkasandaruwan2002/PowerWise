const express = require('express');
const router = express.Router();
const {
    submitReading,
    getReadings,
    compareUsage,
    detectAnomalies,
    deleteReading
} = require('../controllers/Metercontroller');
const { validate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/readings:
 *   post:
 *     summary: Submit a new meter reading
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - readingValue
 *             properties:
 *               readingValue:
 *                 type: number
 *                 minimum: 0
 *                 example: 1250
 *               readingType:
 *                 type: string
 *                 enum: ['Monthly', 'Weekly', 'Custom']
 *                 default: 'Monthly'
 *               readingDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-22"
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Reading submitted with optional comparison to previous reading
 *       400:
 *         description: Validation error
 */
router.post('/', validate(schemas.reading), submitReading);

/**
 * @swagger
 * /api/readings:
 *   get:
 *     summary: Get reading history with pagination
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ['Monthly', 'Weekly', 'Custom']
 *         description: Filter by reading type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of readings
 */
router.get('/', getReadings);

/**
 * @swagger
 * /api/readings/compare:
 *   get:
 *     summary: Compare estimated vs actual consumption
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comparison data with estimated bill, accuracy, and status
 */
router.get('/compare', compareUsage);

/**
 * @swagger
 * /api/readings/anomalies:
 *   get:
 *     summary: Detect usage anomalies in reading history
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Anomaly detection results with statistical analysis
 */
router.get('/anomalies', detectAnomalies);

/**
 * @swagger
 * /api/readings/{id}:
 *   delete:
 *     summary: Delete a meter reading
 *     tags: [MeterReadings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reading deleted
 *       404:
 *         description: Reading not found
 */
router.delete('/:id', deleteReading);

module.exports = router;
