const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Household = require('../models/Household');

const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRE || '7d',
    });

// ── User Registration ───────────────────────────────────────────────────────
const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
        const { name, email, password, incomeBracket } = req.body;
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
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Admin Registration (requires secret key) ───────────────────────────────
const registerAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
        const { name, email, password, incomeBracket, adminKey } = req.body;
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
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
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
        const user = await User.findById(req.user._id);

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

module.exports = { register, registerAdmin, login, logout, getMe, updatePassword, updateProfile };