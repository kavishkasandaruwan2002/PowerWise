const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

async function checkSetup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to DB\n');

        const BudgetPlan = require('../backend/models/budgetPlan');
        const ConsumptionRecord = require('../backend/models/consumptionRecord');
        const Alert = require('../backend/models/alertSchema');
        const Household = require('../backend/models/Household');

        // Check households
        const households = await Household.find({}).populate('owner', 'email name');
        console.log('=== HOUSEHOLDS ===');
        console.log(`Found ${households.length} household(s)`);
        households.forEach((h, i) => {
            console.log(`  [${i}] ${h._id} - Owner: ${h.owner?.email || 'N/A'}`);
        });

        if (households.length === 0) {
            console.log('\n❌ No households found. Create a household first!');
            await mongoose.disconnect();
            return;
        }

        const householdId = households[0]._id;
        const userId = households[0].owner?._id;

        // Check budgets
        const budgets = await BudgetPlan.find({ householdId }).sort({ startDate: -1 });
        console.log('\n=== BUDGETS ===');
        console.log(`Found ${budgets.length} budget(s) for this household`);
        budgets.forEach((b, i) => {
            const pct = b.monthlyLimit > 0 ? ((b.currentBill / b.monthlyLimit) * 100).toFixed(1) : 0;
            console.log(`  [${i}] Rs.${b.monthlyLimit} | Current: Rs.${b.currentBill} | ${pct}% used | Status: ${b.status}`);
        });

        // Check consumption
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const consumptions = await ConsumptionRecord.find({
            householdId,
            readingDate: { $gte: startOfMonth }
        }).sort({ readingDate: -1 });

        const totalConsumption = consumptions.reduce((sum, c) => sum + c.consumption, 0);
        console.log('\n=== CONSUMPTION (This Month) ===');
        console.log(`Records: ${consumptions.length} | Total: ${totalConsumption.toFixed(2)} kWh`);
        if (consumptions.length > 0) {
            console.log('  Recent readings:');
            consumptions.slice(0, 5).forEach(c => {
                console.log(`    ${new Date(c.readingDate).toLocaleDateString()}: ${c.consumption} kWh`);
            });
        }

        // Check existing alerts
        const alerts = await Alert.find({ householdId }).sort({ createdAt: -1 }).limit(10);
        console.log('\n=== RECENT ALERTS ===');
        console.log(`Found ${alerts.length} alert(s)`);
        if (alerts.length > 0) {
            alerts.forEach(a => {
                console.log(`  [${a.type}] ${a.severity} - ${a.title} | Read: ${a.isRead ? 'Yes' : 'No'} | ${new Date(a.createdAt).toLocaleString()}`);
            });
        }

        // What's needed to trigger alert?
        if (budgets.length > 0) {
            const budget = budgets[0];
            const threshold = budget.monthlyLimit * 0.8;
            const needed = threshold - budget.currentBill;
            console.log('\n=== TO TRIGGER ALERT ===');
            console.log(`Budget: Rs.${budget.monthlyLimit}`);
            console.log(`80% threshold: Rs.${threshold}`);
            console.log(`Current bill: Rs.${budget.currentBill}`);
            console.log(`Need Rs.${needed.toFixed(2)} more to trigger alert`);
            console.log(`(~${(needed / 10).toFixed(1)} kWh at Rs.10/kWh)`);
        } else {
            console.log('\n⚠️ No budget found. Create one to test budget alerts!');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkSetup();
