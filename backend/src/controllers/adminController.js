import User from '../models/User.js';
import Household from '../models/Household.js';
import * as userService from '../services/userService.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { signAccessToken, signRefreshToken } from '../utils/token.js';
import { adminSecret } from '../config/env.js';

/**
 * @desc    Register a new admin user (requires admin secret)
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
        // Create default household for admin
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
        role: 'admin', // Force admin role
        householdId,
        isEmailVerified: true // Auto-verify admin
    });

    // Generate tokens
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
        status: 'success',
        message: 'Admin user created successfully',
        data: {
            user,
            accessToken,
            refreshToken
        }
    });
});

/**
 * @desc    Get all users (existing - moved for organization)
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = catchAsync(async (req, res, next) => {
    const result = await userService.getAllUsers(req.query);
    res.status(200).json({
        status: 'success',
        data: result
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

    // Validate role
    if (!['family_user', 'admin', 'utility_agent'].includes(role)) {
        return next(new AppError('Invalid role. Must be family_user, admin, or utility_agent', 400));
    }

    // Prevent admin from changing their own role
    if (id === req.user.id && role !== 'admin') {
        return next(new AppError('You cannot remove your own admin privileges', 403));
    }

    const user = await userService.updateUserRole(id, role);

    res.status(200).json({
        status: 'success',
        message: 'User role updated successfully',
        data: { user }
    });
});

/**
 * @desc    Assign user to household
 * @route   POST /api/v1/admin/users/assign-household
 * @access  Private/Admin
 */
export const assignUserToHousehold = catchAsync(async (req, res, next) => {
    const { userId, householdId } = req.body;

    if (!userId || !householdId) {
        return next(new AppError('Please provide userId and householdId', 400));
    }

    const user = await userService.assignUserToHousehold(userId, householdId);

    res.status(200).json({
        status: 'success',
        message: 'User assigned to household successfully',
        data: { user }
    });
});

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/v1/admin/dashboard
 * @access  Private/Admin
 */
export const getAdminDashboard = catchAsync(async (req, res, next) => {
    // Get statistics
    const totalUsers = await User.countDocuments();
    const totalHouseholds = await Household.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const familyUserCount = await User.countDocuments({ role: 'family_user' });
    const utilityAgentCount = await User.countDocuments({ role: 'utility_agent' });

    // Get recent users
    const recentUsers = await User.find()
        .populate('householdId')
        .sort('-createdAt')
        .limit(5)
        .select('-password -refreshToken');

    res.status(200).json({
        status: 'success',
        data: {
            statistics: {
                totalUsers,
                totalHouseholds,
                adminCount,
                familyUserCount,
                utilityAgentCount
            },
            recentUsers
        }
    });
});

/**
 * @desc    Delete user (admin only)
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
        return next(new AppError('You cannot delete your own account', 403));
    }

    const user = await User.findById(id);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Delete user's household if it exists
    if (user.householdId) {
        await Household.findByIdAndDelete(user.householdId);
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
    });
});