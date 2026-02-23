import User from '../models/User.js';
import Household from '../models/Household.js';
import BudgetHistory from '../models/BudgetHistory.js';
import * as userService from '../services/userService.js';
import * as budgetService from '../services/budgetService.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { adminSecret } from '../config/env.js';

/**
 * @desc    Register a new admin user
 * @route   POST /api/v1/auth/admin/register
 * @access  Public (with secret key)
 */
export const registerAdmin = catchAsync(async (req, res, next) => {
    const { email, password, firstName, lastName, adminSecret: providedSecret, household } = req.body;

    // Verify admin secret
    if (providedSecret !== adminSecret) {
        return next(new AppError('Invalid admin secret key', 403));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('User already exists with this email', 400));
    }

    // Create household if provided, otherwise create default
    let householdId;
    if (household && Object.keys(household).length > 0) {
        const newHousehold = await Household.create(household);
        householdId = newHousehold._id;
    } else {
        const defaultHousehold = await Household.create({
            address: 'Admin Headquarters',
            size: 1,
            incomeLevel: 'high',
            type: 'other',
            tariffType: 'domestic',
            monthlyBudget: 0
        });
        householdId = defaultHousehold._id;
    }

    // Create admin user
    const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: 'admin',
        householdId,
        isEmailVerified: true
    });

    res.status(201).json({
        status: 'success',
        message: 'Admin user created successfully',
        data: {
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        }
    });
});

/**
 * @desc    Get all users (paginated)
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .populate('householdId')
        .select('-password -refreshToken')
        .skip(skip)
        .limit(limit)
        .sort('-createdAt');

    const total = await User.countDocuments();

    res.status(200).json({
        status: 'success',
        data: {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

/**
 * @desc    Get user details by ID
 * @route   GET /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const getUserDetails = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
        .populate('householdId')
        .select('-password -refreshToken');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Get user statistics
    const budgetCount = await BudgetHistory.countDocuments({ updatedBy: user._id });
    const lastLogin = user.lastLogin;
    const accountAge = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

    res.status(200).json({
        status: 'success',
        data: {
            user,
            stats: {
                budgetCount,
                lastLogin,
                accountAge,
                hasHousehold: !!user.householdId
            }
        }
    });
});

/**
 * @desc    Update user role
 * @route   PATCH /api/v1/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['family_user', 'admin', 'utility_agent'].includes(role)) {
        return next(new AppError('Invalid role. Must be family_user, admin, or utility_agent', 400));
    }

    // Prevent admin from changing their own role
    if (id === req.user.id && role !== 'admin') {
        return next(new AppError('You cannot remove your own admin privileges', 403));
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'User role updated successfully',
        data: { user }
    });
});

/**
 * @desc    Get all households (paginated)
 * @route   GET /api/v1/admin/households
 * @access  Private/Admin
 */
export const getAllHouseholds = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const households = await Household.find()
        .skip(skip)
        .limit(limit)
        .sort('-createdAt');

    const total = await Household.countDocuments();

    // Get member count for each household
    const householdsWithStats = await Promise.all(
        households.map(async (household) => {
            const memberCount = await User.countDocuments({ householdId: household._id });
            const budgetCount = await BudgetHistory.countDocuments({ householdId: household._id });
            const latestBudget = await BudgetHistory.findOne({ householdId: household._id })
                .sort('-createdAt');

            return {
                ...household.toObject(),
                memberCount,
                budgetCount,
                latestBudget: latestBudget?.budgetAmount || null
            };
        })
    );

    res.status(200).json({
        status: 'success',
        data: {
            households: householdsWithStats,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

/**
 * @desc    Get household details by ID
 * @route   GET /api/v1/admin/households/:id
 * @access  Private/Admin
 */
export const getHouseholdDetails = catchAsync(async (req, res, next) => {
    const household = await Household.findById(req.params.id);

    if (!household) {
        return next(new AppError('Household not found', 404));
    }

    // Get members
    const members = await User.find({ householdId: household._id })
        .select('firstName lastName email role createdAt');

    // Get budget history
    const budgetHistory = await BudgetHistory.find({ householdId: household._id })
        .populate('updatedBy', 'firstName lastName')
        .sort('-createdAt')
        .limit(10);

    // Calculate statistics
    const totalBudgets = await BudgetHistory.countDocuments({ householdId: household._id });
    const avgBudget = await BudgetHistory.aggregate([
        { $match: { householdId: household._id } },
        { $group: { _id: null, avg: { $avg: '$budgetAmount' } } }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            household,
            members,
            budgetHistory,
            stats: {
                totalMembers: members.length,
                totalBudgets,
                averageBudget: avgBudget[0]?.avg || 0,
                currentBudget: household.monthlyBudget
            }
        }
    });
});

/**
 * @desc    Update household
 * @route   PATCH /api/v1/admin/households/:id
 * @access  Private/Admin
 */
export const updateHousehold = catchAsync(async (req, res, next) => {
    const allowedFields = ['address', 'city', 'postalCode', 'size', 'incomeLevel', 'type', 'tariffType', 'monthlyBudget', 'monthlyBill', 'billDueDate', 'isActive'];
    const updateData = {};

    Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
            updateData[key] = req.body[key];
        }
    });

    if (Object.keys(updateData).length === 0) {
        return next(new AppError('No valid fields to update', 400));
    }

    const household = await Household.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!household) {
        return next(new AppError('Household not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Household updated successfully',
        data: { household }
    });
});

/**
 * @desc    Delete household
 * @route   DELETE /api/v1/admin/households/:id
 * @access  Private/Admin
 */
export const deleteHousehold = catchAsync(async (req, res, next) => {
    const household = await Household.findById(req.params.id);

    if (!household) {
        return next(new AppError('Household not found', 404));
    }

    // Check if household has members
    const memberCount = await User.countDocuments({ householdId: household._id });
    if (memberCount > 0) {
        return next(new AppError('Cannot delete household with existing members. Please reassign or delete members first.', 400));
    }

    // Delete associated budget history
    await BudgetHistory.deleteMany({ householdId: household._id });

    // Delete household
    await Household.findByIdAndDelete(req.params.id);

    res.status(200).json({
        status: 'success',
        message: 'Household and associated budget history deleted successfully'
    });
});

/**
 * @desc    Get system statistics
 * @route   GET /api/v1/admin/statistics
 * @access  Private/Admin
 */
export const getSystemStatistics = catchAsync(async (req, res, next) => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(now.setDate(now.getDate() - 7));

    const [
        totalUsers,
        totalHouseholds,
        totalBudgets,
        usersByRole,
        householdsByType,
        householdsByIncome,
        newUsersToday,
        newHouseholdsToday,
        activeUsers,
        averageBudget
    ] = await Promise.all([
        User.countDocuments(),
        Household.countDocuments(),
        BudgetHistory.countDocuments(),
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        Household.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
        Household.aggregate([{ $group: { _id: '$incomeLevel', count: { $sum: 1 } } }]),
        User.countDocuments({ createdAt: { $gte: today } }),
        Household.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments({ lastLogin: { $gte: weekAgo } }),
        BudgetHistory.aggregate([
            { $group: { _id: null, avg: { $avg: '$budgetAmount' } } }
        ])
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            overview: {
                totalUsers,
                totalHouseholds,
                totalBudgets,
                activeUsers,
                newUsersToday,
                newHouseholdsToday
            },
            users: {
                byRole: usersByRole.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            },
            households: {
                byType: householdsByType.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                byIncome: householdsByIncome.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            },
            budgets: {
                average: averageBudget[0]?.avg || 0,
                total: totalBudgets
            },
            timestamps: {
                generatedAt: new Date().toISOString()
            }
        }
    });
});

/**
 * @desc    Search users
 * @route   GET /api/v1/admin/users/search
 * @access  Private/Admin
 */
export const searchUsers = catchAsync(async (req, res, next) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
        return next(new AppError('Search query must be at least 2 characters', 400));
    }

    const users = await User.find({
        $or: [
            { email: { $regex: q, $options: 'i' } },
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } }
        ]
    })
        .populate('householdId')
        .select('-password -refreshToken')
        .limit(20);

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users }
    });
});

/**
 * @desc    Export users as CSV
 * @route   GET /api/v1/admin/export/users-csv
 * @access  Private/Admin
 */
export const exportUsersCSV = catchAsync(async (req, res, next) => {
    const users = await User.find()
        .populate('householdId')
        .select('-password -refreshToken -passwordResetToken -passwordResetExpires');

    // Create CSV header
    const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Verified', 'Created At', 'Household Address', 'Household Size', 'Income Level', 'Property Type', 'Tariff Type', 'Monthly Budget'];

    // Create CSV rows
    const rows = users.map(user => [
        user._id.toString(),
        user.email,
        user.firstName,
        user.lastName,
        user.role,
        user.isEmailVerified ? 'Yes' : 'No',
        user.createdAt.toISOString().split('T')[0],
        user.householdId?.address || '',
        user.householdId?.size || '',
        user.householdId?.incomeLevel || '',
        user.householdId?.type || '',
        user.householdId?.tariffType || '',
        user.householdId?.monthlyBudget || 0
    ]);

    // Convert to CSV string
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const filename = `users-export-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent));

    res.send(csvContent);
});