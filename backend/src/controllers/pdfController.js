import { generateUserProfilePDF, generateHouseholdReportPDF, generateAllUsersReportPDF } from '../services/pdfService.js';
import User from '../models/User.js';
import Household from '../models/Household.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/**
 * @desc    Download own profile as PDF
 * @route   GET /api/v1/users/profile/download
 * @access  Private
 */
export const downloadUserProfilePDF = catchAsync(async (req, res, next) => {
    // Get user with populated household
    const user = await User.findById(req.user.id).populate('householdId');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Generate PDF
    const pdfBuffer = await generateUserProfilePDF(user);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=user-profile-${user._id}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
});

/**
 * @desc    Download household report as PDF
 * @route   GET /api/v1/users/household/download
 * @access  Private
 */
export const downloadHouseholdReportPDF = catchAsync(async (req, res, next) => {
    // Get user with household
    const user = await User.findById(req.user.id).populate('householdId');

    if (!user || !user.householdId) {
        return next(new AppError('Household not found', 404));
    }

    // Get all members of this household
    const members = await User.find({ householdId: user.householdId })
        .select('firstName lastName email role');

    // Generate PDF
    const pdfBuffer = await generateHouseholdReportPDF(user.householdId, members);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=household-report-${user.householdId._id}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
});

/**
 * @desc    Download all users report as PDF (Admin only)
 * @route   GET /api/v1/admin/reports/users/download
 * @access  Private/Admin
 */
export const downloadAllUsersReportPDF = catchAsync(async (req, res, next) => {
    // Get all users with populated households
    const users = await User.find()
        .populate('householdId')
        .select('-password -refreshToken -passwordResetToken -passwordResetExpires');

    // Generate PDF
    const pdfBuffer = await generateAllUsersReportPDF(users);

    // Set response headers
    const filename = `all-users-report-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
});