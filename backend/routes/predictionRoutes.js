const express = require('express');
const { protect, householdAccess } = require('../middleware/auth');
const { getHouseholdWeather, predictConsumption } = require('../controllers/predictionController');

const router = express.Router();
router.use(protect); // all routes require authentication

/**
 * @swagger
 * /api/prediction/{householdId}/weather:
 *   get:
 *     tags: [🌤️ Weather & Prediction]
 *     summary: Get current weather and 5‑day forecast for a household
 *     description: Requires household location (latitude/longitude) to be set.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *     responses:
 *       200:
 *         description: Weather data retrieved
 *       400:
 *         description: Household location missing
 *       500:
 *         description: Weather API error
 */
router.get('/:householdId/weather', householdAccess, getHouseholdWeather);

/**
 * @swagger
 * /api/prediction/{householdId}/predict:
 *   get:
 *     tags: [🌤️ Weather & Prediction]
 *     summary: Predict next month's electricity consumption
 *     description: |
 *       Uses at least 3 months of historical budgets and weather data to estimate next month's usage.
 *       Optionally specify `month` and `year` query parameters to predict for a particular month.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month to predict (default = next month)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year to predict (default = current year if next month is this year, else next year)
 *     responses:
 *       200:
 *         description: Prediction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 prediction:
 *                   type: object
 *                   properties:
 *                     month:
 *                       type: integer
 *                     year:
 *                       type: integer
 *                     estimatedAmount:
 *                       type: number
 *                     basedOnMonths:
 *                       type: integer
 *                     averageTemperature:
 *                       type: string
 *                     notes:
 *                       type: string
 *       400:
 *         description: Not enough historical data
 */
router.get('/:householdId/predict', householdAccess, predictConsumption);

module.exports = router;