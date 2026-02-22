import crypto from 'crypto';
import User from '../models/User.js';
import Household from '../models/Household.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import AppError from '../utils/AppError.js';
import { sendEmail } from '../utils/email.js';
import { clientUrl } from '../config/env.js';

export const registerUser = async (userData) => {
    try {
        const { email, password, firstName, lastName, household } = userData;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new AppError('User already exists with this email', 400);

        // Create household first
        console.log('Creating household with data:', household); // Add logging
        const newHousehold = await Household.create(household);
        console.log('Household created:', newHousehold);

        // Create user
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            householdId: newHousehold._id,
        });

        console.log('User created:', user);
        return user;
    } catch (error) {
        console.error('Registration error:', error); // This will show in console
        throw error; // Re-throw to be caught by catchAsync
    }
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Incorrect email or password', 401);
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken) => {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
    }

    const newAccessToken = signAccessToken(user._id);
    return newAccessToken;
};

export const logout = async (userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new AppError('No user found with that email', 404);

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetURL = `${clientUrl}/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget, ignore this email.`;

    await sendEmail(user.email, 'Your password reset token (valid for 10 min)', message);
};

export const resetPassword = async (token, newPassword) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) throw new AppError('Token is invalid or has expired', 400);

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();
};