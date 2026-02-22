import * as budgetService from '../services/budgetService.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/**
 * @desc    Update current month's budget
 * @route   PATCH /api/v1/users/budget
 * @access  Private
 */
export const updateBudget = catchAsync(async (req, res, next) => {
    const { budgetAmount, notes } = req.body;

    if (!budgetAmount || budgetAmount < 0) {
        return next(new AppError('Please provide a valid budget amount', 400));
    }

    // Get user's household
    const user = await User.findById(req.user.id);
    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 404));
    }

    // Update budget
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
 * @desc    Get budget history for user's household
 * @route   GET /api/v1/users/budget/history
 * @access  Private
 */
export const getBudgetHistory = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 404));
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

    const history = await BudgetHistory.find({ householdId: user.householdId })
        .populate('updatedBy', 'firstName lastName')
        .sort('-year -month');

    // Create CSV
    const csvRows = [];
    csvRows.push('Month,Year,Budget Amount,Previous Budget,Change,Change %,Updated By,Reason,Notes,Updated At');

    history.forEach(entry => {
        csvRows.push([
            entry.month,
            entry.year,
            entry.budgetAmount,
            entry.previousBudget || 'N/A',
            entry.changeAmount || 0,
            entry.changePercentage || 0,
            entry.updatedBy ? `${entry.updatedBy.firstName} ${entry.updatedBy.lastName}` : 'System',
            entry.reason,
            entry.notes || '',
            new Date(entry.createdAt).toLocaleString()
        ].join(','));
    });

    const csvString = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=budget-history-${Date.now()}.csv`);
    res.send(csvString);
});