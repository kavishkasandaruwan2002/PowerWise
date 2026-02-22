import * as userService from '../services/userService.js';
import * as budgetService from '../services/budgetService.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/User.js';
import { generateHouseholdQR } from '../services/qrService.js';

export const getProfile = catchAsync(async (req, res, next) => {
    const user = await userService.getProfile(req.user.id);
    res.status(200).json({
        status: 'success',
        data: { user }
    });
});

export const updateProfile = catchAsync(async (req, res, next) => {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: { user }
    });
});

export const changePassword = catchAsync(async (req, res, next) => {
    await userService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
    });
});

export const deleteAccount = catchAsync(async (req, res, next) => {
    await userService.deleteAccount(req.user.id);
    res.status(204).send();
});

export const getBudgetHistory = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const history = await budgetService.getBudgetHistory(user.householdId);
    res.status(200).json({
        status: 'success',
        data: history
    });
});

export const updateBudget = catchAsync(async (req, res, next) => {
    const { budgetAmount } = req.body;
    const user = await User.findById(req.user.id);
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const household = await budgetService.updateBudget(user.householdId, budgetAmount, month, year);
    res.status(200).json({
        status: 'success',
        message: 'Budget updated successfully',
        data: { household }
    });
});

/**
 * @desc    Generate QR code for user's household
 * @route   GET /api/v1/users/household/qr
 * @access  Private
 */
export const getHouseholdQR = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('householdId');

    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 404));
    }

    const qrCode = await generateHouseholdQR(
        user.householdId._id,
        user.householdId.address || 'My Household'
    );

    // Return as HTML for easy viewing
    res.send(`
        <html>
            <head><title>Household QR Code</title></head>
            <body style="text-align:center; font-family:Arial;">
                <h2>🏠 Household QR Code</h2>
                <p>Address: ${user.householdId.address || 'Not specified'}</p>
                <img src="${qrCode}" style="width:300px; height:300px;"/>
                <p>Scan to join this household or view details</p>
                <p><small>Generated: ${new Date().toLocaleString()}</small></p>
            </body>
        </html>
    `);
});

/**
 * @desc    Join household by scanning QR
 * @route   POST /api/v1/users/household/join
 * @access  Private
 */
export const joinHouseholdByQR = catchAsync(async (req, res, next) => {
    const { householdId, token } = req.body;

    // Verify token (simplified - in production, validate properly)
    const isValid = await verifyQRToken(householdId, token);
    if (!isValid) {
        return next(new AppError('Invalid QR code', 400));
    }

    // Update user's household
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { householdId },
        { new: true }
    ).populate('householdId');

    res.status(200).json({
        status: 'success',
        message: 'Successfully joined household',
        data: { user }
    });
});