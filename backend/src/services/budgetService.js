import BudgetHistory from '../models/BudgetHistory.js';
import Household from '../models/Household.js';
import AppError from '../utils/AppError.js';

/**
 * Update budget for a household and create history entry
 */
export const updateBudget = async (householdId, newBudget, userId, reason = 'manual_update', notes = '') => {
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
        // Find previous budget for change calculation
        const previousEntry = await BudgetHistory.findOne({
            householdId,
            $or: [
                { year, month: { $lt: month } },
                { year: { $lt: year } }
            ]
        }).sort({ year: -1, month: -1 });

        const previousBudget = previousEntry?.budgetAmount || household.monthlyBudget;
        const changeAmount = newBudget - previousBudget;
        const changePercentage = previousBudget > 0 ? Number((changeAmount / previousBudget * 100).toFixed(2)) : 0;

        // Create new history entry
        historyEntry = await BudgetHistory.create({
            householdId,
            month,
            year,
            budgetAmount: newBudget,
            previousBudget,
            changeAmount,
            changePercentage,
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

    const filter = { householdId };

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

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
        stats.averageBudget = Number((amounts.reduce((a, b) => a + b, 0) / amounts.length).toFixed(2));
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

        stats.totalIncrease = Number(stats.totalIncrease.toFixed(2));
        stats.totalDecrease = Number(stats.totalDecrease.toFixed(2));
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
        ? Number((ytdEntries.reduce((sum, e) => sum + e.budgetAmount, 0) / ytdEntries.length).toFixed(2))
        : 0;

    const calculatePercentageChange = (oldValue, newValue) => {
        if (!oldValue || !newValue) return 0;
        return Number(((newValue - oldValue) / oldValue * 100).toFixed(2));
    };

    return {
        current: current?.budgetAmount || 0,
        previousMonth: previous?.budgetAmount || 0,
        sameMonthLastYear: lastYear?.budgetAmount || 0,
        ytdAverage,
        monthOverMonth: calculatePercentageChange(previous?.budgetAmount, current?.budgetAmount),
        yearOverYear: calculatePercentageChange(lastYear?.budgetAmount, current?.budgetAmount)
    };
};

/**
 * Get budget forecast based on history
 */
export const getBudgetForecast = async (householdId) => {
    const history = await BudgetHistory.find({ householdId })
        .sort({ year: 1, month: 1 })
        .limit(6);

    if (history.length < 3) {
        return {
            canForecast: false,
            message: 'Need at least 3 months of data for accurate forecast'
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
    const variance = values.reduce((sum, v, i) => {
        const predicted = slope * i + intercept;
        return sum + Math.pow(v - predicted, 2);
    }, 0) / n;

    const confidence = Math.max(0, Math.min(100, 100 - (variance / (sumY / n) * 10)));

    return {
        canForecast: true,
        confidence: Math.round(confidence),
        trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
        nextMonth: forecast[0],
        nextQuarter: forecast,
        basedOnMonths: history.length
    };
};

/**
 * Export budget history as CSV
 */
export const exportBudgetHistory = async (householdId) => {
    const history = await BudgetHistory.find({ householdId })
        .populate('updatedBy', 'firstName lastName')
        .sort('-year -month');

    if (history.length === 0) {
        return 'Month,Year,Budget Amount,Previous Budget,Change,Change %,Updated By,Reason,Notes,Updated At\nNo data available';
    }

    const headers = ['Month', 'Year', 'Budget Amount (LKR)', 'Previous Budget (LKR)', 'Change (LKR)', 'Change %', 'Updated By', 'Reason', 'Notes', 'Last Updated'];

    const rows = history.map(entry => [
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
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
};