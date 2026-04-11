const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

async function createTestData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to DB\n');

        const ConsumptionRecord = require('../backend/models/consumptionRecord');
        const BudgetPlan = require('../backend/models/budgetPlan');
        const Household = require('../backend/models/Household');

        // Get first household
        const household = await Household.findOne({}).populate('owner');
        if (!household) {
            console.log('❌ No household found. Create one first!');
            process.exit(1);
        }

        console.log(`Using household: ${household._id}`);
        console.log(`Owner: ${household.owner?.email}\n`);

        const householdId = household._id;
        const userId = household.owner._id;

        // Create consumption records for last 30 days
        console.log('Creating consumption records...');
        const records = [];
        const now = new Date();

        for (let i = 30; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            // Only create if doesn't exist
            const existing = await ConsumptionRecord.findOne({
                householdId,
                readingDate: {
                    $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                    $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                }
            });

            if (!existing) {
                records.push({
                    householdId,
                    userId,
                    consumption: 10 + Math.random() * 5, // 10-15 kWh per day
                    readingDate: date,
                    period: 'daily',
                    isEstimated: false
                });
            }
        }

        if (records.length > 0) {
            await ConsumptionRecord.insertMany(records);
            console.log(`✓ Created ${records.length} consumption records`);
        } else {
            console.log('✓ Consumption records already exist');
        }

        // Check for existing budget
        const existingBudget = await BudgetPlan.findOne({ householdId, isActive: true });

        if (!existingBudget) {
            console.log('\nCreating test budget...');
            const budget = new BudgetPlan({
                householdId,
                userId,
                monthlyLimit: 500, // Rs. 500 budget
                alertThresholds: {
                    percentageOfBudget: 80
                },
                startDate: new Date(now.getFullYear(), now.getMonth(), 1),
                endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
                isActive: true,
                status: 'active'
            });
            await budget.save();
            console.log(`✓ Created budget: Rs. 500/month`);
        } else {
            console.log(`\n✓ Budget exists: Rs. ${existingBudget.monthlyLimit}`);
        }

        // Calculate total consumption
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const consumptions = await ConsumptionRecord.find({
            householdId,
            readingDate: { $gte: startOfMonth }
        });

        const totalConsumption = consumptions.reduce((sum, c) => sum + c.consumption, 0);
        console.log(`\nTotal consumption this month: ${totalConsumption.toFixed(2)} kWh`);
        console.log(`Estimated bill: ~Rs. ${(totalConsumption * 10).toFixed(2)} (at Rs.10/kWh)`);
        console.log(`\n✓ Test data ready! Check the Alerts page.`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

createTestData();
