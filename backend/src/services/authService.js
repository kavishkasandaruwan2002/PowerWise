import User from '../models/User.js';
import Household from '../models/Household.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import AppError from '../utils/AppError.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import { clientUrl } from '../config/env.js';

export const registerUser = async (userData) => {
    console.log('📝 ===== REGISTRATION STARTED =====');
    console.log('1. Received userData:', JSON.stringify(userData, null, 2));

    try {
        const { email, password, firstName, lastName, household } = userData;

        // Validate required fields
        if (!email || !password || !firstName || !lastName || !household) {
            console.log('❌ Missing required fields');
            throw new AppError('Missing required fields', 400);
        }

        console.log('2. Checking for existing user with email:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            throw new AppError('User already exists with this email', 400);
        }
        console.log('✅ No existing user found');

        console.log('3. Creating household with data:', JSON.stringify(household, null, 2));
        const newHousehold = await Household.create(household);
        console.log('✅ Household created successfully:', {
            id: newHousehold._id,
            address: newHousehold.address,
            size: newHousehold.size
        });

        console.log('4. Creating user with data:', {
            email,
            firstName,
            lastName,
            householdId: newHousehold._id
        });

        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            householdId: newHousehold._id,
        });

        console.log('✅ User created successfully:', {
            id: user._id,
            email: user.email,
            role: user.role
        });

        console.log('📝 ===== REGISTRATION COMPLETED SUCCESSFULLY =====');
        return user;

    } catch (error) {
        console.log('❌ ===== REGISTRATION FAILED =====');
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        if (error.code) console.log('Error code:', error.code);
        if (error.errors) console.log('Validation errors:', error.errors);
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
    const message = `<p>Forgot your password? Click <a href="${resetURL}">here</a> to reset your password.</p><p>If you didn't request this, ignore this email.</p>`;

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