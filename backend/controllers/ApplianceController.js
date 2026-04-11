const Appliance = require('../models/Appliance');
const CalculationService = require('../services/CalculationService');
const CarbonFootprintService = require('../services/CarbonFootprintService');

// @desc    Get all appliances for user
// @route   GET /api/appliances

exports.getAppliances = async (req, res) => {
    try {
        const filter = { createdBy: req.user.id };

        // Optional query filters
        if (req.query.category) {
            filter.category = req.query.category;
        }
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }

        const appliances = await Appliance.find(filter).sort({ createdAt: -1 });

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
        console.error('getAppliances error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single appliance by ID
// @route   GET /api/appliances/:id
// @access  Private
exports.getAppliance = async (req, res) => {
    try {
        const appliance = await Appliance.findById(req.params.id);

        if (!appliance) {
            return res.status(404).json({ success: false, error: 'Appliance not found' });
        }

        // Check ownership
        if (appliance.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        res.json({ success: true, data: appliance });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ success: false, error: 'Invalid appliance ID' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add new appliance
// @route   POST /api/appliances
// @access  Private
exports.addAppliance = async (req, res) => {
    try {
        console.log('Received addAppliance request body:', req.body);
        console.log('User from token:', req.user);

        // Add user to body
        req.body.createdBy = req.user.id;

        // Use household from authenticated user if not provided in body
        // Note: req.user.household is the field name in the model
        if (!req.body.householdId) {
            req.body.householdId = req.user.household;
        }

        if (!req.body.householdId) {
            return res.status(400).json({ 
                success: false, 
                error: ['Household configuration required. Please set up your household node in settings first.'] 
            });
        }

        console.log('Processed body for DB:', req.body);

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
        console.error('addAppliance error:', err.message);
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
        if (appliance.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        // Prevent changing ownership fields
        delete req.body.createdBy;
        delete req.body.householdId;

        appliance = await Appliance.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: appliance });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ success: false, error: 'Invalid appliance ID' });
        }
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
        if (appliance.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await appliance.deleteOne();

        res.json({ success: true, data: {} });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ success: false, error: 'Invalid appliance ID' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get appliance replacement suggestions
// @route   GET /api/appliances/:id/suggestions
// @access  Private
exports.getApplianceSuggestions = async (req, res) => {
    try {
        const appliance = await Appliance.findById(req.params.id);

        if (!appliance) {
            return res.status(404).json({ success: false, error: 'Appliance not found' });
        }

        if (appliance.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const suggestion = CalculationService.generateReplacementSuggestion(appliance);

        res.json({
            success: true,
            data: suggestion || { message: 'This appliance is already efficient. No replacement needed.' }
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ success: false, error: 'Invalid appliance ID' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get efficiency comparison across all user appliances
// @route   GET /api/appliances/efficiency
// @access  Private
exports.getEfficiencyComparison = async (req, res) => {
    try {
        const appliances = await Appliance.find({ createdBy: req.user.id });
        const comparison = CalculationService.compareEfficiencyRatings(appliances);

        res.json({
            success: true,
            data: comparison
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get carbon footprint for all appliances
// @route   GET /api/appliances/carbon
// @access  Private
exports.getCarbonFootprint = async (req, res) => {
    try {
        const appliances = await Appliance.find({ createdBy: req.user.id });

        if (appliances.length === 0) {
            return res.json({
                success: true,
                data: { message: 'No appliances found. Add appliances to calculate carbon footprint.' }
            });
        }

        const totalMonthlyKWh = appliances.reduce(
            (sum, app) => sum + CalculationService.calculateMonthlyKWh(app), 0
        );

        // Use the carbon footprint service (with API fallback)
        const overallFootprint = await CarbonFootprintService.calculateCarbonFootprint(totalMonthlyKWh);
        const applianceBreakdown = CarbonFootprintService.calculateApplianceCarbonFootprint(appliances);

        res.json({
            success: true,
            data: {
                overall: overallFootprint,
                byAppliance: applianceBreakdown
            }
        });
    } catch (err) {
        console.error('getCarbonFootprint error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
