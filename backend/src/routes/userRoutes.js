import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/role.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema, budgetUpdateSchema } from '../validations/userValidation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and management
 */

router.use(protect);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile (with household)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update profile (user fields and/or household)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               household:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   size:
 *                     type: number
 *                   incomeLevel:
 *                     type: string
 *                     enum: [low, middle, high]
 *                   type:
 *                     type: string
 *                     enum: [apartment, boarding, rural, other]
 *                   tariffType:
 *                     type: string
 *                     enum: [domestic, religious, small_business]
 *                   monthlyBudget:
 *                     type: number
 *     responses:
 *       200:
 *         description: Updated profile
 */
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);

/**
 * @swagger
 * /users/change-password:
 *   patch:
 *     summary: Change password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 */
router.patch('/change-password', validate(changePasswordSchema), userController.changePassword);

/**
 * @swagger
 * /users/profile:
 *   delete:
 *     summary: Delete own account (and household)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: No content
 */
router.delete('/profile', userController.deleteAccount);

/**
 * @swagger
 * /users/budget/history:
 *   get:
 *     summary: Get household budget history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budget history entries
 */
router.get('/budget/history', userController.getBudgetHistory);

/**
 * @swagger
 * /users/budget:
 *   patch:
 *     summary: Update current month's budget
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               budgetAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated household
 */
router.patch('/budget', validate(budgetUpdateSchema), userController.updateBudget);

// Admin only routes
router.use(restrictTo('admin'));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated users list
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Update user role (admin only)
 *     tags: [Admin]
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
 *               role:
 *                 type: string
 *                 enum: [family_user, admin, utility_agent]
 *     responses:
 *       200:
 *         description: Updated user
 */
router.patch('/:id/role', userController.updateUserRole);

/**
 * @swagger
 * /users/assign-household:
 *   post:
 *     summary: Assign user to a different household (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               householdId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user with new household
 */
router.post('/assign-household', userController.assignUserToHousehold);

export default router;