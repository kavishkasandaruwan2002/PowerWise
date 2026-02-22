import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema, budgetUpdateSchema } from '../validations/userValidation.js';
import { downloadUserProfilePDF, downloadHouseholdReportPDF } from '../controllers/pdfController.js';
import {
    updateBudget,
    getBudgetHistory,
    getBudgetComparison,
    getBudgetForecast,
    exportBudgetHistory
} from '../controllers/budgetController.js';


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

/**
 * @swagger
 * /users/profile/download:
 *   get:
 *     summary: Download own profile as PDF
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/profile/download', downloadUserProfilePDF);

/**
 * @swagger
 * /users/household/download:
 *   get:
 *     summary: Download household report as PDF
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/household/download', downloadHouseholdReportPDF);

/**
 * @swagger
 * /users/budget:
 *   patch:
 *     summary: Update current month's budget
 *     tags: [Budget]
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
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Budget updated
 */
router.patch('/budget', validate(budgetUpdateSchema), updateBudget);

/**
 * @swagger
 * /users/budget/history:
 *   get:
 *     summary: Get budget history with statistics
 *     tags: [Budget]
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
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget history
 */
router.get('/budget/history', getBudgetHistory);

/**
 * @swagger
 * /users/budget/comparison:
 *   get:
 *     summary: Get budget comparison (MoM, YoY)
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comparison data
 */
router.get('/budget/comparison', getBudgetComparison);

/**
 * @swagger
 * /users/budget/forecast:
 *   get:
 *     summary: Get budget forecast
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Forecast data
 */
router.get('/budget/forecast', getBudgetForecast);

/**
 * @swagger
 * /users/budget/export:
 *   get:
 *     summary: Export budget history as CSV
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 */
router.get('/budget/export', exportBudgetHistory);

router.get('/household/qr', userController.getHouseholdQR);
router.post('/household/join', userController.joinHouseholdByQR);

export default router;