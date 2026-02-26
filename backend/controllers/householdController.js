const Household = require('../models/Household');
const User = require('../models/User');

// ── Create Household ───────────────────────────────────────────────────────
const createHousehold = async (req, res) => {
    try {
        const { name, householdSize, householdType, location, incomeBracket, tariffType } = req.body;
        if (await Household.findOne({ owner: req.user._id })) {
            return res.status(409).json({ success: false, message: 'You already own a household. Update it instead.' });
        }
        const household = await Household.create({
            name, owner: req.user._id, members: [req.user._id], householdSize,
            householdType: householdType || 'house', location,
            incomeBracket: incomeBracket || req.user.incomeBracket,
            tariffType: tariffType || 'domestic',
        });
        await User.findByIdAndUpdate(req.user._id, { household: household._id });
        return res.status(201).json({ success: true, message: 'Household created.', household });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Get My Household ───────────────────────────────────────────────────────
const getMyHousehold = async (req, res) => {
    try {
        const household = await Household.findOne({
            $or: [{ owner: req.user._id }, { members: req.user._id }],
        })
            .populate('owner', 'name email incomeBracket')
            .populate('members', 'name email role');
        if (!household) return res.status(404).json({ success: false, message: 'No household found.' });
        return res.status(200).json({ success: true, household });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Update Household ───────────────────────────────────────────────────────
const updateHousehold = async (req, res) => {
    try {
        const { name, householdSize, householdType, location, incomeBracket, tariffType } = req.body;
        const household = req.household;
        if (household.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only the household owner can update.' });
        }
        if (name)           household.name = name;
        if (householdSize)  household.householdSize = householdSize;
        if (householdType)  household.householdType = householdType;
        if (location)       household.location = { ...household.location, ...location };
        if (incomeBracket)  household.incomeBracket = incomeBracket;
        if (tariffType)     household.tariffType = tariffType;
        await household.save();
        return res.status(200).json({ success: true, message: 'Household updated.', household });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Add Member ─────────────────────────────────────────────────────────────
const addMember = async (req, res) => {
    try {
        const { email } = req.body;
        const household = req.household;
        if (household.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the household owner can add members.' });
        }
        const memberUser = await User.findOne({ email });
        if (!memberUser) return res.status(404).json({ success: false, message: 'User not found.' });
        if (memberUser.household) return res.status(409).json({ success: false, message: 'User already belongs to a household.' });
        if (household.members.map((m) => m.toString()).includes(memberUser._id.toString())) {
            return res.status(409).json({ success: false, message: 'User is already a member.' });
        }
        household.members.push(memberUser._id);
        await household.save();
        await User.findByIdAndUpdate(memberUser._id, { household: household._id });
        return res.status(200).json({ success: true, message: `${memberUser.name} added to household.`, household });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Remove Member ──────────────────────────────────────────────────────────
const removeMember = async (req, res) => {
    try {
        const { memberId } = req.params;
        const household = req.household;
        if (household.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the household owner can remove members.' });
        }
        if (memberId === household.owner.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot remove the household owner.' });
        }
        household.members = household.members.filter((m) => m.toString() !== memberId);
        await household.save();
        await User.findByIdAndUpdate(memberId, { household: null });
        return res.status(200).json({ success: true, message: 'Member removed.', household });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Set Budget ─────────────────────────────────────────────────────────────
const setBudget = async (req, res) => {
    try {
        const { month, year, targetAmount, notes } = req.body;
        const household = req.household;
        if (!month || !year || !targetAmount) {
            return res.status(400).json({ success: false, message: 'month, year and targetAmount are required.' });
        }
        const idx = household.budgets.findIndex((b) => b.month === month && b.year === year);
        if (idx >= 0) {
            household.budgets[idx].targetAmount = targetAmount;
            if (notes) household.budgets[idx].notes = notes;
        } else {
            household.budgets.push({ month, year, targetAmount, notes });
        }
        await household.save();
        const budget = household.budgets.find((b) => b.month === month && b.year === year);
        return res.status(200).json({ success: true, message: idx >= 0 ? 'Budget updated.' : 'Budget set.', budget });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Get Budgets ────────────────────────────────────────────────────────────
const getBudgets = async (req, res) => {
    try {
        const household = req.household;
        const sorted = [...household.budgets].sort((a, b) =>
            b.year !== a.year ? b.year - a.year : b.month - a.month
        );
        return res.status(200).json({
            success: true, count: sorted.length,
            currentBudget: household.currentBudget, budgets: sorted,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Delete Budget ──────────────────────────────────────────────────────────
const deleteBudget = async (req, res) => {
    try {
        const { budgetId } = req.params;
        const household = req.household;
        const idx = household.budgets.findIndex((b) => b._id.toString() === budgetId);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Budget entry not found.' });
        household.budgets.splice(idx, 1);
        await household.save();
        return res.status(200).json({ success: true, message: 'Budget entry deleted.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Transfer Ownership ─────────────────────────────────────────────────────
const transferOwnership = async (req, res) => {
    try {
        const { newOwnerId } = req.body;
        const household = req.household;

        // Only current owner can transfer
        if (household.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the owner can transfer ownership.' });
        }

        // Check that newOwnerId is a member of the household
        if (!household.members.some(m => m.toString() === newOwnerId)) {
            return res.status(400).json({ success: false, message: 'New owner must be a member of the household.' });
        }

        // Update owner
        household.owner = newOwnerId;
        await household.save();

        return res.status(200).json({
            success: true,
            message: 'Household ownership transferred.',
            household
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Delete Household ───────────────────────────────────────────────────────
const deleteHousehold = async (req, res) => {
    try {
        const household = req.household;

        // Only owner or admin can delete
        if (household.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only the owner or admin can delete the household.' });
        }

        // Remove household reference from all members
        await User.updateMany(
            { household: household._id },
            { household: null }
        );

        await household.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Household deleted successfully.'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Update Budget by ID ────────────────────────────────────────────────────
const updateBudgetById = async (req, res) => {
    try {
        const { budgetId } = req.params;
        const { targetAmount, notes } = req.body;
        const household = req.household;

        const budget = household.budgets.id(budgetId);
        if (!budget) {
            return res.status(404).json({ success: false, message: 'Budget entry not found.' });
        }

        if (targetAmount !== undefined) {
            if (targetAmount < 0) {
                return res.status(400).json({ success: false, message: 'Target amount cannot be negative.' });
            }
            budget.targetAmount = targetAmount;
        }
        if (notes !== undefined) {
            budget.notes = notes;
        }

        await household.save();
        return res.status(200).json({
            success: true,
            message: 'Budget entry updated.',
            budget
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createHousehold, getMyHousehold, updateHousehold,
    addMember, removeMember,
    setBudget, getBudgets, deleteBudget,
    transferOwnership, deleteHousehold, updateBudgetById
};