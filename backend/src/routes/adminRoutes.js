import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/role.js';
import validate from '../middleware/validate.js';
import { adminRegisterSchema, updateRoleSchema, assignHouseholdSchema } from '../validations/adminValidation.js';
import { downloadAllUsersReportPDF } from '../controllers/pdfController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin only operations
 */

// Public admin registration (requires secret key)
/**
 * @swagger
 * /auth/admin/register:
 *   post:
 *     summary: Register a new admin user (requires admin secret)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - adminSecret
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: Admin@123
 *               firstName:
 *                 type: string
 *                 example: Super
 *               lastName:
 *                 type: string
 *                 example: Admin
 *               adminSecret:
 *                 type: string
 *                 example: MySuperSecretAdminKey123!
 *               household:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   size:
 *                     type: number
 *                   incomeLevel:
 *                     type: string
 *                   type:
 *                     type: string
 *                   tariffType:
 *                     type: string
 *                   monthlyBudget:
 *                     type: number
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       403:
 *         description: Invalid admin secret
 */
router.post('/auth/admin/register', validate(adminRegisterSchema), adminController.registerAdmin);

// All routes below require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/admin/dashboard', adminController.getAdminDashboard);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (paginated)
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
router.get('/admin/users', adminController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
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
 *         description: Role updated
 */
router.patch('/admin/users/:id/role', validate(updateRoleSchema), adminController.updateUserRole);

/**
 * @swagger
 * /admin/users/assign-household:
 *   post:
 *     summary: Assign user to household
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
 *         description: User assigned
 */
router.post('/admin/users/assign-household', validate(assignHouseholdSchema), adminController.assignUserToHousehold);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Admin]
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
 *         description: User deleted
 */
router.delete('/admin/users/:id', adminController.deleteUser);

/**
 * @swagger
 * /admin/reports/users/download:
 *   get:
 *     summary: Download all users report as PDF (Admin only)
 *     tags: [Admin]
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
router.get('/admin/reports/users/download', downloadAllUsersReportPDF);


export default router;