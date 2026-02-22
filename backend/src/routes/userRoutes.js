import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/role.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema, budgetUpdateSchema } from '../validations/userValidation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and management
 */

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
 *         description: User profile with household details
 *       401:
 *         description: Unauthorized
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
 *       400:
 *         description: Validation error
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
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Current password is incorrect
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
 *         description: Account deleted
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
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Updated household
 *       400:
 *         description: Invalid budget amount
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
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated users list
 *       403:
 *         description: Forbidden (not admin)
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
 *       400:
 *         description: Invalid role
 *       404:
 *         description: User not found
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
 *       404:
 *         description: User or household not found
 */
router.post('/assign-household', userController.assignUserToHousehold);

export default router;