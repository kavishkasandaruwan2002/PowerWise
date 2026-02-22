import BudgetHistory from '../models/BudgetHistory.js';
import Household from '../models/Household.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

/**
 * Update budget for a household and create history entry
 * @param {string} householdId - Household ID
 * @param {number} newBudget - New budget amount
 * @param {string} userId - User ID making the change
 * @param {string} reason - Reason for change
 * @param {string} notes - Additional notes
 * @returns {Object} Updated household and history entry
 */
export const updateBudget = async (householdId, newBudget, userId, reason = 'manual_update', notes = '') => {
    // Get current household to check existing budget
    const household = await Household.findById(householdId);
    if (!household) {
        throw new AppError('Household not found', 404);
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Check if there's already a budget entry for this month
    const existingHistory = await BudgetHistory.findOne({
        householdId,
        month,
        year
    });

    let historyEntry;

    if (existingHistory) {
        // Update existing entry
        historyEntry = await BudgetHistory.findByIdAndUpdate(
            existingHistory._id,
            {
                budgetAmount: newBudget,
                updatedBy: userId,
                reason,
                notes
            },
            { new: true, runValidators: true }
        );
    } else {
        // Create new history entry
        historyEntry = await BudgetHistory.create({
            householdId,
            month,
            year,
            budgetAmount: newBudget,
            previousBudget: household.monthlyBudget,
            updatedBy: userId,
            reason,
            notes
        });
    }

    // Update household's current budget
    household.monthlyBudget = newBudget;
    await household.save();

    return {
        household,
        historyEntry
    };
};

/**
 * Get budget history for a household
 * @param {string} householdId - Household ID
 * @param {Object} options - Pagination and filter options
 * @returns {Object} Budget history with statistics
 */
export const getBudgetHistory = async (householdId, options = {}) => {
    const {
        page = 1,
        limit = 12,
        startDate,
        endDate,
        sortBy = 'year',
        sortOrder = -1
    } = options;

    // Build query filter
    const filter = { householdId };

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get paginated history
    const history = await BudgetHistory.find(filter)
        .populate('updatedBy', 'firstName lastName email')
        .sort({ [sortBy]: sortOrder, month: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await BudgetHistory.countDocuments(filter);

    // Calculate statistics
    const allEntries = await BudgetHistory.find({ householdId });

    const stats = {
        totalEntries: allEntries.length,
        averageBudget: 0,
        highestBudget: 0,
        lowestBudget: Infinity,
        totalIncrease: 0,
        totalDecrease: 0,
        trend: 'stable'
    };

    if (allEntries.length > 0) {
        const amounts = allEntries.map(e => e.budgetAmount);
        stats.averageBudget = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        stats.highestBudget = Math.max(...amounts);
        stats.lowestBudget = Math.min(...amounts);

        // Calculate trend
        if (allEntries.length >= 3) {
            const recent = allEntries.slice(-3).map(e => e.budgetAmount);
            if (recent[2] > recent[1] && recent[1] > recent[0]) {
                stats.trend = 'increasing';
            } else if (recent[2] < recent[1] && recent[1] < recent[0]) {
                stats.trend = 'decreasing';
            }
        }

        // Calculate total increase/decrease
        allEntries.forEach(entry => {
            if (entry.changeAmount > 0) {
                stats.totalIncrease += entry.changeAmount;
            } else {
                stats.totalDecrease += Math.abs(entry.changeAmount);
            }
        });
    }

    return {
        history,
        stats,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get budget comparison with previous periods
 * @param {string} householdId - Household ID
 * @returns {Object} Comparison data
 */
export const getBudgetComparison = async (householdId) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get current month's budget
    const current = await BudgetHistory.findOne({
        householdId,
        month: currentMonth,
        year: currentYear
    });

    // Get previous month's budget
    let prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    let prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const previous = await BudgetHistory.findOne({
        householdId,
        month: prevMonth,
        year: prevYear
    });

    // Get same month last year
    const lastYear = await BudgetHistory.findOne({
        householdId,
        month: currentMonth,
        year: currentYear - 1
    });

    // Calculate year-to-date average
    const ytdEntries = await BudgetHistory.find({
        householdId,
        year: currentYear
    });

    const ytdAverage = ytdEntries.length > 0
        ? ytdEntries.reduce((sum, e) => sum + e.budgetAmount, 0) / ytdEntries.length
        : 0;

    return {
        current: current?.budgetAmount || 0,
        previousMonth: previous?.budgetAmount || 0,
        sameMonthLastYear: lastYear?.budgetAmount || 0,
        ytdAverage,
        monthOverMonth: calculatePercentageChange(
            previous?.budgetAmount,
            current?.budgetAmount
        ),
        yearOverYear: calculatePercentageChange(
            lastYear?.budgetAmount,
            current?.budgetAmount
        )
    };
};

/**
 * Calculate percentage change helper
 */
const calculatePercentageChange = (oldValue, newValue) => {
    if (!oldValue || !newValue) return 0;
    return ((newValue - oldValue) / oldValue * 100).toFixed(2);
};

/**
 * Get budget forecast based on history
 * @param {string} householdId - Household ID
 * @returns {Object} Forecast data
 */
export const getBudgetForecast = async (householdId) => {
    const history = await BudgetHistory.find({ householdId })
        .sort({ year: 1, month: 1 })
        .limit(6); // Use last 6 months for forecast

    if (history.length < 3) {
        return {
            canForecast: false,
            message: 'Need at least 3 months of data for forecast'
        };
    }

    // Simple linear regression for forecasting
    const values = history.map(h => h.budgetAmount);
    const indices = history.map((_, i) => i);

    const n = values.length;
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + (x * values[i]), 0);
    const sumXX = indices.reduce((sum, x) => sum + (x * x), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next 3 months
    const forecast = [];
    for (let i = 1; i <= 3; i++) {
        const predictedValue = slope * (n + i - 1) + intercept;
        forecast.push({
            month: (history[history.length - 1].month + i) % 12 || 12,
            predictedAmount: Math.max(0, Math.round(predictedValue))
        });
    }

    // Calculate confidence (simplified)
    const variance = values.reduce((sum, v) => sum + Math.pow(v - (slope * indices[values.indexOf(v)] + intercept), 2), 0) / n;
    const confidence = Math.max(0, Math.min(100, 100 - (variance / sumY * 100)));

    return {
        canForecast: true,
        confidence: Math.round(confidence),
        trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
        nextMonth: forecast[0],
        nextQuarter: forecast,
        based_on_months: history.length
    };
};