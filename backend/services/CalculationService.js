/**
 * CalculationService - Core business logic for energy consumption calculations
 * Handles daily/monthly kWh, category breakdowns, top consumers, anomaly detection,
 * replacement suggestions with savings estimates, and Sri Lankan tariff calculations.
 */
class CalculationService {

    // ─── Sri Lanka CEB Tariff Tiers (Rs per kWh) ───────────────────────
    static SL_TARIFF_TIERS = [
        { min: 0, max: 30, rate: 8.00 },
        { min: 30, max: 60, rate: 10.00 },
        { min: 60, max: 90, rate: 16.00 },
        { min: 90, max: 120, rate: 50.00 },
        { min: 120, max: 180, rate: 75.00 },
        { min: 180, max: Infinity, rate: 100.00 }
    ];

    // ─── Replacement suggestions database ──────────────────────────────
    static REPLACEMENT_DATABASE = {
        Lighting: {
            condition: (app) => app.wattage > 15,
            replacement: { name: '9W LED Bulb', wattage: 9 },
            message: (app) => `Replace ${app.wattage}W bulb with 9W LED`
        },
        Cooling: {
            condition: (app) => app.efficiencyRating !== 'EnergySaving' && app.wattage > 500,
            replacement: { name: 'Inverter AC', wattageReduction: 0.4 },
            message: (app) => `Replace ${app.name} with an Inverter AC (saves ~40% energy)`
        },
        Entertainment: {
            condition: (app) => app.efficiencyRating === 'Old' && app.wattage > 100,
            replacement: { name: 'Energy Star TV', wattageReduction: 0.3 },
            message: (app) => `Replace old ${app.name} with an Energy Star rated model (saves ~30%)`
        },
        Cooking: {
            condition: (app) => app.efficiencyRating === 'Old',
            replacement: { name: 'Induction Cooktop', wattageReduction: 0.25 },
            message: (app) => `Switch to induction cooking (saves ~25% energy)`
        }
    };

    /**
     * Calculate daily consumption in kWh
     * @param {Object} appliance
     * @returns {Number} kWh
     */
    static calculateDailyKWh(appliance) {
        const quantity = appliance.quantity || 1;
        return (appliance.wattage * appliance.dailyUsageHours * quantity) / 1000;
    }

    /**
     * Calculate monthly consumption in kWh (30 days)
     * @param {Object} appliance
     * @returns {Number} kWh
     */
    static calculateMonthlyKWh(appliance) {
        return this.calculateDailyKWh(appliance) * 30;
    }

    /**
     * Calculate monthly bill using Sri Lanka CEB tariff tiers
     * @param {Number} totalKWh - Total monthly kWh
     * @returns {Number} Rs. amount
     */
    static calculateMonthlyBill(totalKWh) {
        let bill = 0;
        let remaining = totalKWh;

        for (const tier of this.SL_TARIFF_TIERS) {
            const tierSize = tier.max === Infinity ? remaining : (tier.max - tier.min);
            const unitsInTier = Math.min(remaining, tierSize);
            if (unitsInTier <= 0) break;

            bill += unitsInTier * tier.rate;
            remaining -= unitsInTier;
        }

        return Math.round(bill * 100) / 100;
    }

    /**
     * Analyze usage breakdown by category
     * @param {Array} appliances
     * @returns {Object} { totalUsage, breakdown, billEstimate }
     */
    static calculateCategoryBreakdown(appliances) {
        if (!appliances || appliances.length === 0) {
            return { totalUsage: 0, breakdown: {}, billEstimate: 0 };
        }

        const totalUsage = appliances.reduce((sum, app) => sum + this.calculateMonthlyKWh(app), 0);
        const breakdown = {};

        appliances.forEach(app => {
            const usage = this.calculateMonthlyKWh(app);
            if (!breakdown[app.category]) {
                breakdown[app.category] = { kWh: 0, percentage: 0, count: 0 };
            }
            breakdown[app.category].kWh += usage;
            breakdown[app.category].count += 1;
        });

        // Calculate percentages
        for (const cat in breakdown) {
            breakdown[cat].percentage = totalUsage > 0
                ? parseFloat(((breakdown[cat].kWh / totalUsage) * 100).toFixed(2))
                : 0;
            breakdown[cat].kWh = parseFloat(breakdown[cat].kWh.toFixed(2));
        }

        return {
            totalUsage: parseFloat(totalUsage.toFixed(2)),
            breakdown,
            billEstimate: this.calculateMonthlyBill(totalUsage)
        };
    }

    /**
     * Identify top consumers and classify impact
     * @param {Array} appliances
     * @returns {Object} { highImpact: [], lowImpact: [], top3: [], totalMonthlyKWh }
     */
    static identifyTopConsumers(appliances) {
        if (!appliances || appliances.length === 0) {
            return { top3: [], highImpact: [], lowImpact: [], totalMonthlyKWh: 0 };
        }

        const totalMonthlyKWh = appliances.reduce((sum, app) => sum + this.calculateMonthlyKWh(app), 0);

        const processed = appliances.map(app => {
            const appObj = app.toObject ? app.toObject() : { ...app };
            const monthlyKWh = this.calculateMonthlyKWh(app);
            return {
                _id: appObj._id,
                name: appObj.name,
                category: appObj.category,
                wattage: appObj.wattage,
                dailyUsageHours: appObj.dailyUsageHours,
                efficiencyRating: appObj.efficiencyRating,
                monthlyKWh: parseFloat(monthlyKWh.toFixed(2)),
                impact: appObj.wattage > 500 ? 'High' : 'Low',
                percentageContribution: totalMonthlyKWh > 0
                    ? parseFloat(((monthlyKWh / totalMonthlyKWh) * 100).toFixed(2))
                    : 0
            };
        });

        processed.sort((a, b) => b.monthlyKWh - a.monthlyKWh);

        return {
            top3: processed.slice(0, 3),
            highImpact: processed.filter(app => app.impact === 'High'),
            lowImpact: processed.filter(app => app.impact === 'Low'),
            totalMonthlyKWh: parseFloat(totalMonthlyKWh.toFixed(2))
        };
    }

    /**
     * Suggest replacements for energy efficiency
     * @param {Object} appliance
     * @returns {Object|null} Suggestion with savings details or null
     */
    static generateReplacementSuggestion(appliance) {
        // Already energy-saving, no replacement needed
        if (appliance.efficiencyRating === 'EnergySaving') return null;

        const categoryRule = this.REPLACEMENT_DATABASE[appliance.category];

        if (categoryRule && categoryRule.condition(appliance)) {
            let newWattage;
            if (categoryRule.replacement.wattage) {
                newWattage = categoryRule.replacement.wattage;
            } else {
                newWattage = appliance.wattage * (1 - categoryRule.replacement.wattageReduction);
            }

            const currentMonthlyKWh = this.calculateMonthlyKWh(appliance);
            const newMonthlyKWh = (newWattage * appliance.dailyUsageHours * 30) / 1000;
            const savingsKWh = currentMonthlyKWh - newMonthlyKWh;
            const monthlySavingsRs = savingsKWh * 30; // Approx Rs. 30/unit average

            return {
                currentAppliance: `${appliance.name} (${appliance.wattage}W)`,
                suggestion: categoryRule.message(appliance),
                replacementName: categoryRule.replacement.name,
                currentWattage: appliance.wattage,
                newWattage: Math.round(newWattage),
                currentMonthlyKWh: parseFloat(currentMonthlyKWh.toFixed(2)),
                newMonthlyKWh: parseFloat(newMonthlyKWh.toFixed(2)),
                savingsKWh: parseFloat(savingsKWh.toFixed(2)),
                monthlySavingsRs: `Rs. ${monthlySavingsRs.toFixed(2)}/month`,
                annualSavingsRs: `Rs. ${(monthlySavingsRs * 12).toFixed(2)}/year`
            };
        }

        // Generic suggestion for Old/Standard non-matching category
        if (appliance.efficiencyRating === 'Old' && appliance.wattage > 100) {
            const savingsPercent = 0.2;
            const currentMonthlyKWh = this.calculateMonthlyKWh(appliance);
            const savingsKWh = currentMonthlyKWh * savingsPercent;
            const monthlySavingsRs = savingsKWh * 30;

            return {
                currentAppliance: `${appliance.name} (${appliance.wattage}W)`,
                suggestion: `Consider upgrading ${appliance.name} to a newer energy-efficient model (save ~20%)`,
                currentMonthlyKWh: parseFloat(currentMonthlyKWh.toFixed(2)),
                savingsKWh: parseFloat(savingsKWh.toFixed(2)),
                monthlySavingsRs: `Rs. ${monthlySavingsRs.toFixed(2)}/month`
            };
        }

        return null;
    }

    /**
     * Detect usage anomalies (sudden spikes/drops)
     * @param {Array} readings - Array of MeterReading documents sorted by date
     * @returns {Array} anomalies found
     */
    static detectAnomalies(readings) {
        if (!readings || readings.length < 3) {
            return { anomalies: [], message: 'Need at least 3 readings for anomaly detection' };
        }

        const anomalies = [];

        // Calculate consumptions between consecutive readings
        const consumptions = [];
        for (let i = 1; i < readings.length; i++) {
            const diff = readings[i - 1].readingValue - readings[i].readingValue;
            const days = Math.max(1,
                (new Date(readings[i - 1].readingDate) - new Date(readings[i].readingDate)) / (1000 * 60 * 60 * 24)
            );
            consumptions.push({
                reading: readings[i - 1],
                consumption: diff,
                dailyAvg: diff / days,
                days: Math.round(days)
            });
        }

        if (consumptions.length < 2) {
            return { anomalies: [], message: 'Not enough data points' };
        }

        // Calculate mean and standard deviation
        const dailyAvgs = consumptions.map(c => c.dailyAvg);
        const mean = dailyAvgs.reduce((s, v) => s + v, 0) / dailyAvgs.length;
        const variance = dailyAvgs.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / dailyAvgs.length;
        const stdDev = Math.sqrt(variance);

        // Flag entries that are more than 1.5 standard deviations from mean
        const threshold = 1.5;
        consumptions.forEach((c, idx) => {
            const zScore = stdDev > 0 ? (c.dailyAvg - mean) / stdDev : 0;
            if (Math.abs(zScore) > threshold) {
                anomalies.push({
                    date: c.reading.readingDate,
                    dailyAvg: parseFloat(c.dailyAvg.toFixed(2)),
                    expectedAvg: parseFloat(mean.toFixed(2)),
                    deviation: parseFloat(((c.dailyAvg - mean) / mean * 100).toFixed(1)),
                    type: c.dailyAvg > mean ? 'SPIKE' : 'DROP',
                    severity: Math.abs(zScore) > 2.5 ? 'Critical' : 'Warning',
                    message: c.dailyAvg > mean
                        ? `⚠️ Spike detected: ${parseFloat(c.dailyAvg.toFixed(2))} kWh/day (${parseFloat(((c.dailyAvg - mean) / mean * 100).toFixed(1))}% above average)`
                        : `📉 Drop detected: ${parseFloat(c.dailyAvg.toFixed(2))} kWh/day (${parseFloat(((mean - c.dailyAvg) / mean * 100).toFixed(1))}% below average)`
                });
            }
        });

        return {
            anomalies,
            stats: {
                averageDailyConsumption: parseFloat(mean.toFixed(2)),
                standardDeviation: parseFloat(stdDev.toFixed(2)),
                dataPoints: consumptions.length
            }
        };
    }

    /**
     * Compare efficiency ratings across appliances
     * @param {Array} appliances
     * @returns {Object} efficiency comparison report
     */
    static compareEfficiencyRatings(appliances) {
        if (!appliances || appliances.length === 0) {
            return { old: [], standard: [], energySaving: [], potentialMonthlySavingsKWh: 0, potentialMonthlySavingsRs: 0 };
        }

        const groups = {
            Old: [],
            Standard: [],
            EnergySaving: []
        };

        appliances.forEach(app => {
            const monthlyKWh = this.calculateMonthlyKWh(app);
            const appData = {
                _id: app._id,
                name: app.name,
                category: app.category,
                wattage: app.wattage,
                monthlyKWh: parseFloat(monthlyKWh.toFixed(2)),
                monthlyCostRs: parseFloat((monthlyKWh * 30).toFixed(2))
            };
            if (groups[app.efficiencyRating]) {
                groups[app.efficiencyRating].push(appData);
            }
        });

        // Calculate potential savings if all Old/Standard appliances were EnergySaving
        let potentialSavings = 0;
        groups.Old.forEach(app => {
            potentialSavings += app.monthlyKWh * 0.35; // 35% savings estimate
        });
        groups.Standard.forEach(app => {
            potentialSavings += app.monthlyKWh * 0.15; // 15% savings estimate
        });

        return {
            old: groups.Old,
            standard: groups.Standard,
            energySaving: groups.EnergySaving,
            potentialMonthlySavingsKWh: parseFloat(potentialSavings.toFixed(2)),
            potentialMonthlySavingsRs: parseFloat((potentialSavings * 30).toFixed(2))
        };
    }
}

module.exports = CalculationService;
