const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Household = require('../models/Household');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');


const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRE || '7d',
    });

// ── User Registration ───────────────────────────────────────────────────────
const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array().map(err => err.msg).join(', ');
        return res.status(400).json({ success: false, message: errorMsg, errors: errors.array() });
    }
    try {
        let { name, email, password, incomeBracket } = req.body;
        email = email.toLowerCase().trim();
        
        if (await User.findOne({ email })) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }
        const user = await User.create({
            name, email, password, incomeBracket,
            role: 'user',
        });
        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role, incomeBracket: user.incomeBracket },
        });
    } catch (err) {
        console.error('REGISTRATION ERROR:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Admin Registration (requires secret key) ───────────────────────────────
const registerAdmin = async (req, res) => {
        console.log('ENV CHECK:', process.env.JWT_ACCESS_SECRET, process.env.ADMIN_SECRET_KEY);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array().map(err => err.msg).join(', ');
        return res.status(400).json({ success: false, message: errorMsg, errors: errors.array() });
    }
    try {
        let { name, email, password, incomeBracket, adminKey } = req.body;
        email = email.toLowerCase().trim();

        if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ success: false, message: 'Invalid or missing admin key.' });
        }
        if (await User.findOne({ email })) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }
        const user = await User.create({
            name, email, password, incomeBracket,
            role: 'admin',
        });
        return res.status(201).json({
            success: true,
            message: 'Admin registered successfully.',
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role, incomeBracket: user.incomeBracket },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Login ──────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array().map(err => err.msg).join(', ');
        return res.status(400).json({ success: false, message: errorMsg, errors: errors.array() });
    }
    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();
        
        const user = await User.findOne({ email }).select('+password');
        console.log('LOGIN ATTEMPT BY:', email);
        if (user) {
            const isMatch = await user.matchPassword(password);
            console.log('PASSWORD MATCH STATUS:', isMatch);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }
        } else {
            console.log('USER NOT FOUND:', email);
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
        }
        const household = user.household
            ? await Household.findById(user.household).select('name householdType location tariffType')
            : null;
        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role, incomeBracket: user.incomeBracket, household },
        });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Get Me ─────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('household', 'name householdType location tariffType incomeBracket budgets');
        return res.status(200).json({ success: true, user });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Logout ─────────────────────────────────────────────────────────────────
const logout = (req, res) =>
    res.status(200).json({ success: true, message: 'Logged out successfully. Remove your token on the client.' });

// ── Update Password ────────────────────────────────────────────────────────
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
        }
        user.password = newPassword;
        await user.save();
        return res.status(200).json({ success: true, message: 'Password updated.', token: generateToken(user._id) });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Update Profile ─────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const { name, email, incomeBracket } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (name) user.name = name;
        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: user._id } });
            if (existing) {
                return res.status(409).json({ success: false, message: 'Email already in use.' });
            }
            user.email = email;
        }
        if (incomeBracket) {
            if (!['low', 'middle', 'high'].includes(incomeBracket)) {
                return res.status(400).json({ success: false, message: 'Income bracket must be low, middle, or high.' });
            }
            user.incomeBracket = incomeBracket;
        }

        await user.save();
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, incomeBracket: user.incomeBracket }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Forgot Password ────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'There is no user with that email.' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        // For frontend development, it might be:
        const frontendUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a put request to: \n\n ${frontendUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #1e293b; border-radius: 15px; background-color: #0b0e14; color: #ffffff;">
                        <h2 style="color: #3b82f6; text-align: center; text-transform: uppercase; letter-spacing: 2px;">PowerWise Security</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">You are receiving this email because a password reset was requested for your account.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${frontendUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Reset Password</a>
                        </div>
                        <p style="font-size: 14px; color: #64748b; border-top: 1px solid #1e293b; pt-10;">If you did not request this, please ignore this email.</p>
                        <p style="font-size: 12px; color: #3b82f6; text-align: center;">Energy Intelligence v02</p>
                    </div>
                `
            });

            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (err) {
            console.error('EMAIL SEND ERROR:', err);
            
            // In development, we still want to give the user the link so they can test
            return res.status(200).json({ 
                success: true, 
                message: 'Email service not configured, but you can use this link to test:', 
                devLink: frontendUrl 
            });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Reset Password ──────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful.',
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role, incomeBracket: user.incomeBracket },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { register, registerAdmin, login, logout, getMe, updatePassword, updateProfile, forgotPassword, resetPassword };