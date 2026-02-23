import express from 'express';
import * as userController from '../controllers/userController.js';
import * as pdfController from '../controllers/pdfController.js';
import * as qrController from '../controllers/qrController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema, budgetUpdateSchema } from '../validations/userValidation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile management
router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.patch('/change-password', validate(changePasswordSchema), userController.changePassword);
router.delete('/profile', userController.deleteAccount);

// Budget management
router.get('/budget/history', userController.getBudgetHistory);
router.patch('/budget', validate(budgetUpdateSchema), userController.updateBudget);
router.get('/budget/comparison', userController.getBudgetComparison);
router.get('/budget/forecast', userController.getBudgetForecast);
router.get('/budget/export', userController.exportBudgetHistory);

// PDF downloads
router.get('/profile/download', pdfController.downloadUserProfilePDF);
router.get('/household/download', pdfController.downloadHouseholdReportPDF);

// QR code features
router.get('/household/qr', qrController.showHouseholdQR);
router.get('/household/qr-data', qrController.getHouseholdQRData);
router.get('/household/qr/download', qrController.downloadHouseholdQR);
router.get('/household/qr-token', qrController.getQRToken);
router.post('/household/qr/regenerate', qrController.regenerateQR);
router.post('/household/join', qrController.joinHouseholdByQR);
router.post('/household/leave', qrController.leaveHousehold);

export default router;