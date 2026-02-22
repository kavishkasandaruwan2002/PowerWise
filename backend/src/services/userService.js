import User from '../models/User.js';
import Household from '../models/Household.js';
import AppError from '../utils/AppError.js';

export const getProfile = async (userId) => {
    const user = await User.findById(userId).populate('householdId');
    if (!user) throw new AppError('User not found', 404);
    return user;
};

export const updateProfile = async (userId, updateData) => {
    const { firstName, lastName, household } = updateData;
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    await user.save({ validateBeforeSave: true });

    if (household && Object.keys(household).length > 0) {
        await Household.findByIdAndUpdate(user.householdId, household, {
            new: true,
            runValidators: true,
        });
    }

    return await User.findById(userId).populate('householdId');
};

export const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
        throw new AppError('Current password is incorrect', 401);
    }
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();
};

export const deleteAccount = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    await Household.findByIdAndDelete(user.householdId);
    await User.findByIdAndDelete(userId);
};

export const getAllUsers = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .populate('householdId')
        .skip(skip)
        .limit(limit)
        .select('-refreshToken');
    const total = await User.countDocuments();

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

export const updateUserRole = async (userId, role) => {
    if (!['family_user', 'admin', 'utility_agent'].includes(role)) {
        throw new AppError('Invalid role', 400);
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).populate('householdId');
    if (!user) throw new AppError('User not found', 404);
    return user;
};

export const assignUserToHousehold = async (userId, householdId) => {
    const household = await Household.findById(householdId);
    if (!household) throw new AppError('Household not found', 404);

    const user = await User.findByIdAndUpdate(
        userId,
        { householdId },
        { new: true, runValidators: true }
    ).populate('householdId');
    if (!user) throw new AppError('User not found', 404);
    return user;
};