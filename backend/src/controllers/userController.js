import * as userService from '../services/userService.js';
import * as budgetService from '../services/budgetService.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/User.js';
import Household from '../models/Household.js';
import AppError from '../utils/AppError.js';

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
export const getProfile = catchAsync(async (req, res, next) => {
    const user = await userService.getProfile(req.user.id);

    res.status(200).json({
        status: 'success',
        data: { user }
    });
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/users/profile
 * @access  Private
 */
export const updateProfile = catchAsync(async (req, res, next) => {
    const user = await userService.updateProfile(req.user.id, req.body);

    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: { user }
    });
});

/**
 * @desc    Change password
 * @route   PATCH /api/v1/users/change-password
 * @access  Private
 */
export const changePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new AppError('Please provide current and new password', 400));
    }

    if (newPassword.length < 6) {
        return next(new AppError('New password must be at least 6 characters', 400));
    }

    await userService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
        status: 'success',
        message: 'Password changed successfully'
    });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/profile
 * @access  Private
 */
export const deleteAccount = catchAsync(async (req, res, next) => {
    await userService.deleteAccount(req.user.id);

    res.status(204).send();
});

/**
 * @desc    Get budget history for user's household
 * @route   GET /api/v1/users/budget/history
 * @access  Private
 */
export const getBudgetHistory = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user.householdId) {
        return next(new AppError('You are not part of any household. Please join or create a household first.', 404));
    }

    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 12,
        startDate: req.query.startDate,
        endDate: req.query.endDate
    };

    const result = await budgetService.getBudgetHistory(user.householdId, options);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

/**
 * @desc    Update monthly budget
 * @route   PATCH /api/v1/users/budget
 * @access  Private
 */
export const updateBudget = catchAsync(async (req, res, next) => {
    const { budgetAmount, notes } = req.body;

    if (!budgetAmount || budgetAmount < 0) {
        return next(new AppError('Please provide a valid budget amount', 400));
    }

    const user = await User.findById(req.user.id);

    if (!user.householdId) {
        return next(new AppError('You are not part of any household. Please join or create a household first.', 404));
    }

    const result = await budgetService.updateBudget(
        user.householdId,
        budgetAmount,
        req.user.id,
        'manual_update',
        notes || `Budget updated by ${req.user.firstName} ${req.user.lastName}`
    );

    res.status(200).json({
        status: 'success',
        message: 'Budget updated successfully',
        data: {
            household: result.household,
            historyEntry: result.historyEntry
        }
    });
});

/**
 * @desc    Get budget comparison (month over month, year over year)
 * @route   GET /api/v1/users/budget/comparison
 * @access  Private
 */
export const getBudgetComparison = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 404));
    }

    const comparison = await budgetService.getBudgetComparison(user.householdId);

    res.status(200).json({
        status: 'success',
        data: comparison
    });
});

/**
 * @desc    Get budget forecast
 * @route   GET /api/v1/users/budget/forecast
 * @access  Private
 */
export const getBudgetForecast = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 404));
    }

    const forecast = await budgetService.getBudgetForecast(user.householdId);

    res.status(200).json({
        status: 'success',
        data: forecast
    });
});

/**
 * @desc    Export budget history as CSV
 * @route   GET /api/v1/users/budget/export
 * @access  Private
 */
export const exportBudgetHistory = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 404));
    }

    const csvData = await budgetService.exportBudgetHistory(user.householdId);

    const filename = `budget-history-${user.householdId}-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvData));

    res.send(csvData);
});