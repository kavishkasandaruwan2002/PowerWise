const User = require('../models/User');
const Household = require('../models/Household');

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.incomeBracket) filter.incomeBracket = req.query.incomeBracket;
        if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
        const [users, total] = await Promise.all([
            User.find(filter).select('-password').populate('household', 'name householdType').skip(skip).limit(limit),
            User.countDocuments(filter),
        ]);
        return res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), users });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getAllHouseholds = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.householdType) filter.householdType = req.query.householdType;
        if (req.query.tariffType) filter.tariffType = req.query.tariffType;
        if (req.query.incomeBracket) filter.incomeBracket = req.query.incomeBracket;
        const [households, total] = await Promise.all([
            Household.find(filter)
                .populate('owner', 'name email incomeBracket')
                .populate('members', 'name email')
                .skip(skip).limit(limit),
            Household.countDocuments(filter),
        ]);
        return res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), households });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getHouseholdById = async (req, res) => {
    try {
        const household = await Household.findById(req.params.id)
            .populate('owner', 'name email incomeBracket role')
            .populate('members', 'name email role incomeBracket');
        if (!household) return res.status(404).json({ success: false, message: 'Household not found.' });
        return res.status(200).json({ success: true, household });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const toggleUserActive = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        user.isActive = !user.isActive;
        await user.save();
        return res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
            user: { id: user._id, name: user.name, isActive: user.isActive },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be "user" or "admin".' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        return res.status(200).json({ success: true, message: `Role updated to ${role}.`, user });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalHouseholds, lowIncome, middleIncome, highIncome, householdTypeStats, tariffStats] =
            await Promise.all([
                User.countDocuments({ isActive: true }),
                Household.countDocuments({ isActive: true }),
                User.countDocuments({ incomeBracket: 'low' }),
                User.countDocuments({ incomeBracket: 'middle' }),
                User.countDocuments({ incomeBracket: 'high' }),
                Household.aggregate([{ $group: { _id: '$householdType', count: { $sum: 1 } } }]),
                Household.aggregate([{ $group: { _id: '$tariffType', count: { $sum: 1 } } }]),
            ]);
        return res.status(200).json({
            success: true,
            stats: {
                totalUsers, totalHouseholds,
                incomeBracketBreakdown: { low: lowIncome, middle: middleIncome, high: highIncome },
                householdTypeBreakdown: householdTypeStats,
                tariffTypeBreakdown: tariffStats,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAllUsers, getAllHouseholds, getHouseholdById, toggleUserActive, changeUserRole, getAdminStats };

// 80% completed