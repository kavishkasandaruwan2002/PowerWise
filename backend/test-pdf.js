import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Household from './src/models/Household.js';
import { generateUserProfilePDF, generateHouseholdReportPDF, generateAllUsersReportPDF } from './src/services/pdfService.js';
import fs from 'fs';

dotenv.config();

const testPDFGeneration = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get a sample user
        const user = await User.findOne().populate('householdId');
        if (!user) {
            console.log('❌ No users found');
            return;
        }

        console.log('📄 Generating user profile PDF...');
        const userPDF = await generateUserProfilePDF(user);
        fs.writeFileSync('test-user-profile.pdf', userPDF);
        console.log('✅ User profile PDF saved as test-user-profile.pdf');

        // Get household members
        if (user.householdId) {
            const members = await User.find({ householdId: user.householdId });
            console.log('📄 Generating household report PDF...');
            const householdPDF = await generateHouseholdReportPDF(user.householdId, members);
            fs.writeFileSync('test-household-report.pdf', householdPDF);
            console.log('✅ Household report PDF saved as test-household-report.pdf');
        }

        // Get all users
        const allUsers = await User.find().populate('householdId').limit(10);
        console.log('📄 Generating all users report PDF...');
        const allUsersPDF = await generateAllUsersReportPDF(allUsers);
        fs.writeFileSync('test-all-users.pdf', allUsersPDF);
        console.log('✅ All users PDF saved as test-all-users.pdf');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testPDFGeneration();