const MeterReading = require('../models/MeterReading');
const Appliance = require('../models/Appliance');
const CalculationService = require('../services/CalculationService');

// @desc    Submit a new meter reading
// @route   POST /api/readings

exports.submitReading = async (req, res) => {
    try {
        // Set user and household from JWT token
        req.body.submittedBy = req.user.id;
        if (!req.body.householdId) {
            req.body.householdId = req.user.householdId;
        }

        const reading = await MeterReading.create(req.body);

        // Build comparison data
        let comparison = null;
        if (reading.previousReading != null && reading.consumption != null) {
            const lastReading = await MeterReading.findOne({
                householdId: reading.householdId,
                readingDate: { $lt: reading.readingDate }
            }).sort({ readingDate: -1 });

            if (lastReading) {
                const days = Math.max(1,
                    (new Date(reading.readingDate) - new Date(lastReading.readingDate)) / (1000 * 60 * 60 * 24)
                );

                comparison = {
                    previousReading: reading.previousReading,
                    currentReading: reading.readingValue,
                    consumptionKWh: reading.consumption,
                    daysElapsed: Math.round(days),
                    avgDailyKWh: parseFloat((reading.consumption / days).toFixed(2))
                };
            }
        }

        res.status(201).json({
            success: true,
            data: reading,
            comparison
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        console.error('submitReading error:', err);
        res.status(500).json({ success: false, error: 'Server Error', details: err.message });
    }
};

// @desc    Get reading history
// @route   GET /api/readings
// @access  Private
exports.getReadings = async (req, res) => {
    try {
        const filter = { submittedBy: req.user.id };

        // Filter by type if specified
        if (req.query.type) {
            filter.readingType = req.query.type;
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await MeterReading.countDocuments(filter);
        const readings = await MeterReading.find(filter)
            .sort({ readingDate: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            count: readings.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: readings
        });
    } catch (err) {
        console.error('getReadings error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Compare Estimated vs Actual consumption
// @route   GET /api/readings/compare
// @access  Private
exports.compareUsage = async (req, res) => {
    try {
        // Get all user appliances
        const appliances = await Appliance.find({ createdBy: req.user.id });
        const breakdown = CalculationService.calculateCategoryBreakdown(appliances);
        const estimatedMonthlyKWh = breakdown.totalUsage;

        // Get last 2 readings
        const readings = await MeterReading.find({ submittedBy: req.user.id })
            .sort({ readingDate: -1 })
            .limit(2);

        let actualMonthlyKWh = null;
        let daysElapsed = 0;

        if (readings.length >= 2) {
            const diff = readings[0].readingValue - readings[1].readingValue;
            const days = Math.max(1,
                (new Date(readings[0].readingDate) - new Date(readings[1].readingDate)) / (1000 * 60 * 60 * 24)
            );
            daysElapsed = Math.round(days);
            // Normalize to 30 days
            actualMonthlyKWh = parseFloat(((diff / days) * 30).toFixed(2));
        }

        const hasActual = actualMonthlyKWh !== null;
        const difference = hasActual ? parseFloat((actualMonthlyKWh - estimatedMonthlyKWh).toFixed(2)) : null;
        const accuracy = hasActual && estimatedMonthlyKWh > 0
            ? parseFloat((100 - Math.abs(difference / estimatedMonthlyKWh * 100)).toFixed(1))
            : null;

        let status = 'No data';
        if (hasActual) {
            if (Math.abs(difference) < estimatedMonthlyKWh * 0.1) {
                status = 'On Track ✅';
            } else if (actualMonthlyKWh > estimatedMonthlyKWh) {
                status = 'Over-consuming ⚠️';
            } else {
                status = 'Efficient 🌟';
            }
        }

        res.json({
            success: true,
            data: {
                estimated: parseFloat(estimatedMonthlyKWh.toFixed(2)),
                actual: actualMonthlyKWh !== null ? actualMonthlyKWh : 'Not enough readings',
                differenceKWh: difference,
                estimatedBillRs: breakdown.billEstimate,
                daysElapsed,
                accuracy: accuracy !== null ? `${accuracy}%` : 'N/A',
                status,
                recommendation: difference > 0
                    ? 'Your actual consumption is higher than estimated. Check for appliances running longer than expected.'
                    : difference < 0
                        ? 'Great! Your actual consumption is lower than estimated.'
                        : 'Add more readings to get comparison data.'
            }
        });
    } catch (err) {
        console.error('compareUsage error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Detect anomalies in reading history
// @route   GET /api/readings/anomalies
// @access  Private
exports.detectAnomalies = async (req, res) => {
    try {
        const readings = await MeterReading.find({ submittedBy: req.user.id })
            .sort({ readingDate: -1 })
            .limit(12); // Last 12 readings

        const result = CalculationService.detectAnomalies(readings);

        res.json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('detectAnomalies error:', err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete a meter reading
// @route   DELETE /api/readings/:id
// @access  Private
exports.deleteReading = async (req, res) => {
    try {
        const reading = await MeterReading.findById(req.params.id);

        if (!reading) {
            return res.status(404).json({ success: false, error: 'Reading not found' });
        }

        // Check ownership
        if (reading.submittedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await reading.deleteOne();

        res.json({ success: true, data: {} });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ success: false, error: 'Invalid reading ID' });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
