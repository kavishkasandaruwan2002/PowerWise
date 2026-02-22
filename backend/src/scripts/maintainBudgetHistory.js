import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Household from '../models/Household.js';
import BudgetHistory from '../models/BudgetHistory.js';
import User from '../models/User.js';

dotenv.config();

/**
 * Monthly maintenance script to ensure budget history is complete
 * Run this on the 1st of each month
 */
const maintainBudgetHistory = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Get all households
        const households = await Household.find();

        for (const household of households) {
            // Check if there's a budget entry for current month
            const existingEntry = await BudgetHistory.findOne({
                householdId: household._id,
                month: currentMonth,
                year: currentYear
            });

            if (!existingEntry) {
                // Create entry with current budget
                await BudgetHistory.create({
                    householdId: household._id,
                    month: currentMonth,
                    year: currentYear,
                    budgetAmount: household.monthlyBudget || 0,
                    updatedBy: (await User.findOne({ role: 'admin' }))._id,
                    reason: 'monthly_reset',
                    notes: 'Auto-generated monthly budget entry'
                });
                console.log(`✅ Created budget entry for household ${household._id}`);
            }
        }

        console.log('✅ Budget history maintenance completed');
    } catch (error) {
        console.error('❌ Error in budget maintenance:', error);
    } finally {
        await mongoose.disconnect();
    }
};

maintainBudgetHistory();