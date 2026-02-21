const Appliance = require('../models/Appliance');
const CalculationService = require('../services/CalculationService');

// @desc    Get all appliances for user
// @route   GET /api/appliances
// @access  Private
exports.getAppliances = async (req, res) => {
    try {
        const appliances = await Appliance.find({ user: req.user.id });

        // Calculate totals on the fly
        const insights = CalculationService.identifyTopConsumers(appliances);
        const breakdown = CalculationService.calculateCategoryBreakdown(appliances);

        res.json({
            success: true,
            count: appliances.length,
            data: appliances,
            summary: breakdown,
            insights: insights
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add new appliance
// @route   POST /api/appliances
// @access  Private
exports.addAppliance = async (req, res) => {
    try {
        // Add user to body
        req.body.user = req.user.id;

        const appliance = await Appliance.create(req.body);

        res.status(201).json({
            success: true,
            data: appliance
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update appliance
// @route   PUT /api/appliances/:id
// @access  Private
exports.updateAppliance = async (req, res) => {
    try {
        let appliance = await Appliance.findById(req.params.id);

        if (!appliance) {
            return res.status(404).json({ success: false, error: 'Appliance not found' });
        }

        // Check ownership
        if (appliance.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        appliance = await Appliance.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: appliance });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete appliance
// @route   DELETE /api/appliances/:id
// @access  Private
exports.deleteAppliance = async (req, res) => {
    try {
        const appliance = await Appliance.findById(req.params.id);

        if (!appliance) {
            return res.status(404).json({ success: false, error: 'Appliance not found' });
        }

        // Check ownership
        if (appliance.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await appliance.deleteOne();

        res.json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get appliance suggestions
// @route   GET /api/appliances/:id/suggestions
// @access  Private
exports.getApplianceSuggestions = async (req, res) => {
    try {
        const appliance = await Appliance.findById(req.params.id);

        if (!appliance) return res.status(404).json({ success: false, error: 'Not found' });

        if (appliance.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const suggestion = CalculationService.generateReplacementSuggestion(appliance);

        res.json({
            success: true,
            data: suggestion || { message: "No suggestions available for this appliance." }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
