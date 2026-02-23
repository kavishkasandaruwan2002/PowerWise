import express from 'express';
import * as adminController from '../controllers/adminController.js';
import * as pdfController from '../controllers/pdfController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/role.js';
import validate from '../middleware/validate.js';
import { adminRegisterSchema, updateRoleSchema } from '../validations/adminValidation.js';

const router = express.Router();

// Public admin registration (no auth required)
router.post('/auth/admin/register', validate(adminRegisterSchema), adminController.registerAdmin);

// All routes below require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// User management
router.get('/admin/users', adminController.getAllUsers);
router.get('/admin/users/search', adminController.searchUsers);
router.get('/admin/users/:id', adminController.getUserDetails);
router.patch('/admin/users/:id/role', validate(updateRoleSchema), adminController.updateUserRole);

// Household management
router.get('/admin/households', adminController.getAllHouseholds);
router.get('/admin/households/:id', adminController.getHouseholdDetails);
router.patch('/admin/households/:id', adminController.updateHousehold);
router.delete('/admin/households/:id', adminController.deleteHousehold);

// Statistics and reports
router.get('/admin/statistics', adminController.getSystemStatistics);
router.get('/admin/reports/users/download', pdfController.downloadAllUsersReportPDF);
router.get('/admin/export/users-csv', adminController.exportUsersCSV);

export default router;