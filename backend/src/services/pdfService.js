import PDFDocument from 'pdfkit';
import User from '../models/User.js';
import Household from '../models/Household.js';
import BudgetHistory from '../models/BudgetHistory.js';

/**
 * Generate PDF for user profile
 * @param {Object} user - User object with populated household
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateUserProfilePDF = async (user) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Header
            doc.fontSize(20).text('PowerGuard - User Profile', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(2);

            // User Information Section
            doc.fontSize(16).text('User Information', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12)
                .text(`Name: ${user.firstName} ${user.lastName}`)
                .text(`Email: ${user.email}`)
                .text(`Role: ${user.role}`)
                .text(`Account Created: ${new Date(user.createdAt).toLocaleDateString()}`)
                .text(`Email Verified: ${user.isEmailVerified ? 'Yes' : 'No'}`);

            doc.moveDown(2);

            // Household Information Section
            if (user.householdId) {
                const h = user.householdId;
                doc.fontSize(16).text('Household Information', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(12)
                    .text(`Address: ${h.address || 'Not provided'}`)
                    .text(`Household Size: ${h.size || 'Not specified'} people`)
                    .text(`Income Level: ${h.incomeLevel || 'Not specified'}`)
                    .text(`Property Type: ${h.type || 'Not specified'}`)
                    .text(`Tariff Type: ${h.tariffType || 'Not specified'}`)
                    .text(`Monthly Budget: LKR ${h.monthlyBudget?.toLocaleString() || 0}`);
            }

            doc.moveDown(2);

            // Budget History Section
            doc.fontSize(16).text('Recent Budget History', { underline: true });
            doc.moveDown(0.5);

            // Get last 6 months of budget history
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            BudgetHistory.find({
                householdId: user.householdId,
                createdAt: { $gte: sixMonthsAgo }
            })
                .sort('-year -month')
                .then(history => {
                    if (history.length === 0) {
                        doc.fontSize(12).text('No budget history available');
                    } else {
                        // Create a table
                        let y = doc.y;
                        doc.fontSize(10);

                        // Headers
                        doc.text('Month/Year', 50, y, { width: 100, continued: true });
                        doc.text('Budget Amount (LKR)', 200, y);

                        doc.moveDown();

                        // Data rows
                        history.forEach(entry => {
                            const monthYear = `${entry.month}/${entry.year}`;
                            const amount = entry.budgetAmount.toLocaleString();

                            y = doc.y;
                            doc.text(monthYear, 50, y, { width: 100, continued: true });
                            doc.text(amount, 200, y);
                            doc.moveDown();
                        });
                    }

                    // Footer
                    doc.moveDown(2);
                    doc.fontSize(10).text('Thank you for using PowerGuard!', { align: 'center' });
                    doc.text('This is a system-generated document.', { align: 'center' });

                    doc.end();
                })
                .catch(err => reject(err));

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generate PDF for household report (with all members)
 * @param {Object} household - Household object
 * @param {Array} members - Array of users in the household
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateHouseholdReportPDF = async (household, members) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Header
            doc.fontSize(20).text('PowerGuard - Household Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(2);

            // Household Summary
            doc.fontSize(16).text('Household Summary', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12)
                .text(`Address: ${household.address || 'Not provided'}`)
                .text(`Total Members: ${members.length} people`)
                .text(`Income Level: ${household.incomeLevel || 'Not specified'}`)
                .text(`Property Type: ${household.type || 'Not specified'}`)
                .text(`Tariff Type: ${household.tariffType || 'Not specified'}`)
                .text(`Current Monthly Budget: LKR ${household.monthlyBudget?.toLocaleString() || 0}`);

            doc.moveDown(2);

            // Household Members
            doc.fontSize(16).text('Household Members', { underline: true });
            doc.moveDown(0.5);

            if (members.length === 0) {
                doc.fontSize(12).text('No members in this household');
            } else {
                // Table headers
                let y = doc.y;
                doc.fontSize(10);
                doc.text('Name', 50, y, { width: 150, continued: true });
                doc.text('Email', 200, y, { width: 150, continued: true });
                doc.text('Role', 350, y, { width: 100 });
                doc.moveDown();

                // Table rows
                members.forEach(member => {
                    y = doc.y;
                    doc.text(`${member.firstName} ${member.lastName}`, 50, y, { width: 150, continued: true });
                    doc.text(member.email, 200, y, { width: 150, continued: true });
                    doc.text(member.role, 350, y, { width: 100 });
                    doc.moveDown();
                });
            }

            doc.moveDown(2);

            // Energy Statistics
            doc.fontSize(16).text('Energy Statistics', { underline: true });
            doc.moveDown(0.5);

            // Calculate total budget usage (simplified)
            const totalBudget = household.monthlyBudget || 0;

            doc.fontSize(12)
                .text(`Average Budget per Person: LKR ${members.length ? (totalBudget / members.length).toFixed(2) : 0}`)
                .text(`Monthly Budget Status: ${totalBudget > 0 ? 'Active' : 'Not Set'}`);

            // Footer
            doc.moveDown(2);
            doc.fontSize(10).text('This report is generated for household management purposes.', { align: 'center' });
            doc.text('PowerGuard - Smart Energy Management', { align: 'center' });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generate PDF for all users (Admin only)
 * @param {Array} users - Array of all users with populated households
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateAllUsersReportPDF = async (users) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Header
            doc.fontSize(20).text('PowerGuard - Complete Users Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown(2);

            // Summary Statistics
            const totalUsers = users.length;
            const admins = users.filter(u => u.role === 'admin').length;
            const familyUsers = users.filter(u => u.role === 'family_user').length;
            const utilityAgents = users.filter(u => u.role === 'utility_agent').length;
            const verifiedUsers = users.filter(u => u.isEmailVerified).length;

            doc.fontSize(16).text('System Summary', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12)
                .text(`Total Users: ${totalUsers}`)
                .text(`Admins: ${admins}`)
                .text(`Family Users: ${familyUsers}`)
                .text(`Utility Agents: ${utilityAgents}`)
                .text(`Verified Users: ${verifiedUsers}`)
                .text(`Verification Rate: ${((verifiedUsers / totalUsers) * 100).toFixed(1)}%`);

            doc.moveDown(2);

            // Users List
            doc.fontSize(16).text('All Users', { underline: true });
            doc.moveDown(0.5);

            // Table headers
            let y = doc.y;
            doc.fontSize(8);
            doc.text('Name', 50, y, { width: 100, continued: true });
            doc.text('Email', 150, y, { width: 120, continued: true });
            doc.text('Role', 270, y, { width: 70, continued: true });
            doc.text('Verified', 340, y, { width: 40, continued: true });
            doc.text('Created', 380, y, { width: 70, continued: true });
            doc.text('Household', 450, y, { width: 80 });
            doc.moveDown();

            // Table rows
            users.forEach(user => {
                y = doc.y;
                doc.fontSize(8)
                    .text(`${user.firstName} ${user.lastName}`, 50, y, { width: 100, continued: true })
                    .text(user.email, 150, y, { width: 120, continued: true })
                    .text(user.role, 270, y, { width: 70, continued: true })
                    .text(user.isEmailVerified ? 'Yes' : 'No', 340, y, { width: 40, continued: true })
                    .text(new Date(user.createdAt).toLocaleDateString(), 380, y, { width: 70, continued: true })
                    .text(user.householdId?.address || 'No household', 450, y, { width: 80 });
                doc.moveDown();
            });

            // Footer with page numbers
            const totalPages = doc.bufferedPageRange ? doc.bufferedPageRange().count : 1;
            for (let i = 0; i < totalPages; i++) {
                doc.switchToPage(i);
                doc.fontSize(8)
                    .text(`Page ${i + 1} of ${totalPages}`, 50, doc.page.height - 50, { align: 'center' });
            }

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};