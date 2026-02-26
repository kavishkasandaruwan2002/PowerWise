const express = require('express');

const {
    getAllUsers, getAllHouseholds, getHouseholdById,
    toggleUserActive, changeUserRole, getAdminStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [👑 Admin]
 *     summary: Admin dashboard statistics
 *     description: |
 *       Returns aggregated statistics across all users and households.
 *       Useful for SDG reporting and NGO dashboards.
 *       **Requires admin role.**
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminStatsResponse'
 *       403:
 *         description: Access denied — admin only
 */
router.get('/stats', getAdminStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [👑 Admin]
 *     summary: Get all users
 *     description: Retrieve all users with optional filters and pagination. **Requires admin role.**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *       - in: query
 *         name: incomeBracket
 *         schema:
 *           type: string
 *           enum: [low, middle, high]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
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
 *         description: Paginated list of users
 *       403:
 *         description: Access denied — admin only
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/toggle-active:
 *   put:
 *     tags: [👑 Admin]
 *     summary: Activate / deactivate user
 *     description: Toggle a user's active status. Deactivated users cannot login. **Requires admin role.**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ID
 *     responses:
 *       200:
 *         description: User status toggled
 *       404:
 *         description: User not found
 */
router.put('/users/:id/toggle-active', toggleUserActive);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     tags: [👑 Admin]
 *     summary: Change user role
 *     description: Promote to admin or demote to user. **Requires admin role.**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeRoleRequest'
 *           example:
 *             role: admin
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Invalid role value
 *       404:
 *         description: User not found
 */
router.put('/users/:id/role', changeUserRole);

/**
 * @swagger
 * /api/admin/households:
 *   get:
 *     tags: [👑 Admin]
 *     summary: Get all households
 *     description: Retrieve all households with filters and pagination. **Requires admin role.**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: householdType
 *         schema:
 *           type: string
 *           enum: [apartment, boarding_house, rural_home, house]
 *       - in: query
 *         name: tariffType
 *         schema:
 *           type: string
 *           enum: [domestic, religious, small_business]
 *       - in: query
 *         name: incomeBracket
 *         schema:
 *           type: string
 *           enum: [low, middle, high]
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
 *         description: Paginated list of households
 *       403:
 *         description: Access denied — admin only
 */
router.get('/households', getAllHouseholds);

/**
 * @swagger
 * /api/admin/households/{id}:
 *   get:
 *     tags: [👑 Admin]
 *     summary: Get a household by ID
 *     description: Full household detail including all members and budget history. **Requires admin role.**
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Household MongoDB ID
 *     responses:
 *       200:
 *         description: Full household details
 *       404:
 *         description: Household not found
 */
router.get('/households/:id', getHouseholdById);

module.exports = router;