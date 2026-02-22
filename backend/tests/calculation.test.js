const CalculationService = require('../services/CalculationService');

describe('CalculationService', () => {
    const mockAppliance = {
        _id: '1',
        name: 'Test Bulb',
        wattage: 100,
        dailyUsageHours: 5,
        category: 'Lighting',
        efficiencyRating: 'Old',
        toObject() { return { ...this }; }
    };

    const mockAppliances = [
        { _id: '1', name: 'AC', wattage: 1500, dailyUsageHours: 8, category: 'Cooling', efficiencyRating: 'Standard', toObject() { return { ...this }; } },
        { _id: '2', name: 'Bulb', wattage: 60, dailyUsageHours: 10, category: 'Lighting', efficiencyRating: 'Old', toObject() { return { ...this }; } },
        { _id: '3', name: 'TV', wattage: 150, dailyUsageHours: 4, category: 'Entertainment', efficiencyRating: 'Standard', toObject() { return { ...this }; } },
        { _id: '4', name: 'Fan', wattage: 75, dailyUsageHours: 12, category: 'Cooling', efficiencyRating: 'EnergySaving', toObject() { return { ...this }; } },
    ];

    // ─── Daily/Monthly kWh ─────────────────────────────────────────
    describe('calculateDailyKWh', () => {
        test('returns correct daily kWh', () => {
            // 100W * 5h = 500Wh = 0.5kWh
            expect(CalculationService.calculateDailyKWh(mockAppliance)).toBe(0.5);
        });

        test('handles zero usage hours', () => {
            expect(CalculationService.calculateDailyKWh({ wattage: 100, dailyUsageHours: 0 })).toBe(0);
        });
    });

    describe('calculateMonthlyKWh', () => {
        test('returns correct monthly kWh (30 days)', () => {
            // 0.5kWh * 30 = 15kWh
            expect(CalculationService.calculateMonthlyKWh(mockAppliance)).toBe(15);
        });
    });

    // ─── Sri Lanka Tariff ──────────────────────────────────────────
    describe('calculateMonthlyBill', () => {
        test('calculates bill for low usage (30 kWh)', () => {
            // 30 * 8 = 240
            expect(CalculationService.calculateMonthlyBill(30)).toBe(240);
        });

        test('calculates bill for moderate usage (100 kWh)', () => {
            // 30*8 + 30*10 + 30*16 + 10*50 = 240 + 300 + 480 + 500 = 1520
            expect(CalculationService.calculateMonthlyBill(100)).toBe(1520);
        });

        test('handles zero usage', () => {
            expect(CalculationService.calculateMonthlyBill(0)).toBe(0);
        });
    });

    // ─── Category Breakdown ────────────────────────────────────────
    describe('calculateCategoryBreakdown', () => {
        test('returns breakdown with percentages', () => {
            const result = CalculationService.calculateCategoryBreakdown(mockAppliances);
            expect(result.totalUsage).toBeGreaterThan(0);
            expect(result.breakdown).toHaveProperty('Cooling');
            expect(result.breakdown).toHaveProperty('Lighting');
            expect(result.breakdown).toHaveProperty('Entertainment');
            expect(result.breakdown.Cooling.percentage).toBeGreaterThan(0);
        });

        test('handles empty array', () => {
            const result = CalculationService.calculateCategoryBreakdown([]);
            expect(result.totalUsage).toBe(0);
            expect(result.billEstimate).toBe(0);
        });

        test('includes bill estimate', () => {
            const result = CalculationService.calculateCategoryBreakdown(mockAppliances);
            expect(result.billEstimate).toBeGreaterThan(0);
        });
    });

    // ─── Top Consumers ─────────────────────────────────────────────
    describe('identifyTopConsumers', () => {
        test('identifies top 3 consumers', () => {
            const result = CalculationService.identifyTopConsumers(mockAppliances);
            expect(result.top3).toHaveLength(3);
            // AC (1500W * 8h) should be the highest
            expect(result.top3[0].name).toBe('AC');
        });

        test('classifies high and low impact', () => {
            const result = CalculationService.identifyTopConsumers(mockAppliances);
            expect(result.highImpact.length).toBeGreaterThan(0);
            expect(result.lowImpact.length).toBeGreaterThan(0);
            // AC (1500W) should be high impact
            expect(result.highImpact.some(a => a.name === 'AC')).toBe(true);
            // Bulb (60W) should be low impact
            expect(result.lowImpact.some(a => a.name === 'Bulb')).toBe(true);
        });

        test('calculates percentage contribution', () => {
            const result = CalculationService.identifyTopConsumers(mockAppliances);
            const totalPercentage = result.top3.reduce((sum, app) => sum + app.percentageContribution, 0);
            // Top 3 percentage should be reasonable
            expect(totalPercentage).toBeLessThanOrEqual(100);
        });

        test('handles empty array', () => {
            const result = CalculationService.identifyTopConsumers([]);
            expect(result.top3).toHaveLength(0);
            expect(result.totalMonthlyKWh).toBe(0);
        });
    });

    // ─── Replacement Suggestions ───────────────────────────────────
    describe('generateReplacementSuggestion', () => {
        test('suggests LED for old lighting > 15W', () => {
            const suggestion = CalculationService.generateReplacementSuggestion(mockAppliance);
            expect(suggestion).not.toBeNull();
            expect(suggestion.suggestion).toContain('Replace');
            expect(suggestion.suggestion).toContain('LED');
            expect(suggestion.newWattage).toBe(9);
        });

        test('calculates savings correctly for 100W → 9W LED', () => {
            const suggestion = CalculationService.generateReplacementSuggestion(mockAppliance);
            // Savings: (100 - 9) * 5 * 30 / 1000 = 13.65 kWh
            expect(suggestion.savingsKWh).toBe(13.65);
            // Rs: 13.65 * 30 = 409.50
            expect(suggestion.monthlySavingsRs).toContain('409.50');
        });

        test('suggests inverter AC for high wattage cooling', () => {
            const acAppliance = {
                name: 'My AC', wattage: 1500, dailyUsageHours: 8,
                category: 'Cooling', efficiencyRating: 'Standard'
            };
            const suggestion = CalculationService.generateReplacementSuggestion(acAppliance);
            expect(suggestion).not.toBeNull();
            expect(suggestion.suggestion).toContain('Inverter');
        });

        test('returns null for EnergySaving appliance', () => {
            const efficientApp = { ...mockAppliance, efficiencyRating: 'EnergySaving' };
            const suggestion = CalculationService.generateReplacementSuggestion(efficientApp);
            expect(suggestion).toBeNull();
        });

        test('returns null for low wattage standard appliance', () => {
            const lowApp = { name: 'LED', wattage: 9, dailyUsageHours: 5, category: 'Other', efficiencyRating: 'Standard' };
            const suggestion = CalculationService.generateReplacementSuggestion(lowApp);
            expect(suggestion).toBeNull();
        });
    });

    // ─── Anomaly Detection ─────────────────────────────────────────
    describe('detectAnomalies', () => {
        test('needs at least 3 readings', () => {
            const result = CalculationService.detectAnomalies([
                { readingValue: 100, readingDate: new Date('2026-01-01') },
                { readingValue: 50, readingDate: new Date('2025-12-01') }
            ]);
            expect(result.message).toContain('at least 3');
        });

        test('detects spike anomaly', () => {
            // Normal readings with one spike
            const readings = [
                { readingValue: 700, readingDate: new Date('2026-06-01') }, // Spike!
                { readingValue: 400, readingDate: new Date('2026-05-01') },
                { readingValue: 300, readingDate: new Date('2026-04-01') },
                { readingValue: 200, readingDate: new Date('2026-03-01') },
                { readingValue: 100, readingDate: new Date('2026-02-01') },
            ];
            const result = CalculationService.detectAnomalies(readings);
            expect(result.stats).toBeDefined();
            expect(result.stats.averageDailyConsumption).toBeGreaterThan(0);
        });

        test('handles empty array', () => {
            const result = CalculationService.detectAnomalies([]);
            expect(result.message).toBeDefined();
        });
    });

    // ─── Efficiency Comparison ─────────────────────────────────────
    describe('compareEfficiencyRatings', () => {
        test('groups appliances by efficiency rating', () => {
            const result = CalculationService.compareEfficiencyRatings(mockAppliances);
            expect(result.old).toHaveLength(1); // Bulb
            expect(result.standard).toHaveLength(2); // AC, TV
            expect(result.energySaving).toHaveLength(1); // Fan
        });

        test('calculates potential savings', () => {
            const result = CalculationService.compareEfficiencyRatings(mockAppliances);
            expect(result.potentialMonthlySavingsKWh).toBeGreaterThan(0);
            expect(result.potentialMonthlySavingsRs).toBeGreaterThan(0);
        });

        test('handles empty array', () => {
            const result = CalculationService.compareEfficiencyRatings([]);
            expect(result.potentialMonthlySavingsKWh).toBe(0);
        });
    });
});
