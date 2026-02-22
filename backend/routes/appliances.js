const express = require('express');
const router = express.Router();
const {
    getAppliances,
    getAppliance,
    addAppliance,
    updateAppliance,
    deleteAppliance,
    getApplianceSuggestions,
    getEfficiencyComparison,
    getCarbonFootprint
} = require('../controllers/ApplianceController');
const { validate, validateUpdate, schemas } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect); // Protect all routes

/**
 * @swagger
 * /api/appliances:
 *   get:
 *     summary: Get all appliances for the authenticated user
 *     tags: [Appliances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: ['Cooling', 'Lighting', 'Cooking', 'Standby', 'Entertainment', 'Other']
 *         description: Filter by category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of appliances with insights and breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appliance'
 *                 summary:
 *                   type: object
 *                   description: Category breakdown with percentages
 *                 insights:
 *                   type: object
 *                   description: Top consumers and impact classification
 */
router.get('/', getAppliances);

/**
 * @swagger
 * /api/appliances/efficiency:
 *   get:
 *     summary: Get efficiency comparison across all appliances
 *     tags: [Appliances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Efficiency comparison grouped by rating
 */
router.get('/efficiency', getEfficiencyComparison);

/**
 * @swagger
 * /api/appliances/carbon:
 *   get:
 *     summary: Get carbon footprint for all appliances
 *     tags: [Appliances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carbon footprint data with equivalents
 */
router.get('/carbon', getCarbonFootprint);

/**
 * @swagger
 * /api/appliances/{id}:
 *   get:
 *     summary: Get a single appliance by ID
 *     tags: [Appliances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appliance ID
 *     responses:
 *       200:
 *         description: Appliance details
 *       404:
 *         description: Appliance not found
 */
router.get('/:id', getAppliance);

/**
 * @swagger
 * /api/appliances:
 *   post:
 *     summary: Create a new appliance
 *     tags: [Appliances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - wattage
 *               - dailyUsageHours
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Living Room AC"
 *               category:
 *                 type: string
 *                 enum: ['Cooling', 'Lighting', 'Cooking', 'Standby', 'Entertainment', 'Other']
 *                 example: "Cooling"
 *               wattage:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10000
 *                 example: 1500
 *               dailyUsageHours:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 24
 *                 example: 8
 *               efficiencyRating:
 *                 type: string
 *                 enum: ['Old', 'Standard', 'EnergySaving']
 *                 default: "Standard"
 *     responses:
 *       201:
 *         description: Appliance created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validate(schemas.appliance), addAppliance);

/**
 * @swagger
 * /api/appliances/{id}:
 *   put:
 *     summary: Update an existing appliance
 *     tags: [Appliances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: ['Cooling', 'Lighting', 'Cooking', 'Standby', 'Entertainment', 'Other']
 *               wattage:
 *                 type: number
 *               dailyUsageHours:
 *                 type: number
 *               efficiencyRating:
 *                 type: string
 *                 enum: ['Old', 'Standard', 'EnergySaving']
 *     responses:
 *       200:
 *         description: Appliance updated
 *       404:
 *         description: Not found
 *       403:
 *         description: Not authorized
 */
router.put('/:id', validateUpdate(schemas.appliance), updateAppliance);

/**
 * @swagger
 * /api/appliances/{id}:
 *   delete:
 *     summary: Delete an appliance
 *     tags: [Appliances]
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
 *         description: Appliance deleted
 *       404:
 *         description: Not found
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', deleteAppliance);

/**
 * @swagger
 * /api/appliances/{id}/suggestions:
 *   get:
 *     summary: Get energy-saving replacement suggestions for an appliance
 *     tags: [Appliances]
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
 *         description: Replacement suggestion with savings estimate
 *       404:
 *         description: Appliance not found
 */
router.get('/:id/suggestions', getApplianceSuggestions);

module.exports = router;
