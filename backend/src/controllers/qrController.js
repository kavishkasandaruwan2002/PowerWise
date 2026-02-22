import User from '../models/User.js';
import Household from '../models/Household.js';
import { generateHouseholdQR, verifyQRToken, regenerateQRToken, getQRCodeHTML } from '../services/qrService.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/**
 * @desc    Generate and display QR code for user's household
 * @route   GET /api/v1/users/household/qr
 * @access  Private
 */
export const showHouseholdQR = catchAsync(async (req, res, next) => {
    // Get user with household
    const user = await User.findById(req.user.id).populate('householdId');

    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 404));
    }

    // Get auth token from request
    const authToken = req.headers.authorization.split(' ')[1];

    // Generate QR code HTML page with token
    const html = await getQRCodeHTML(
        user.householdId._id,
        user.householdId.address || 'My Household',
        authToken
    );

    res.send(html);
});

/**
 * @desc    Get QR code as JSON data (for mobile apps)
 * @route   GET /api/v1/users/household/qr-data
 * @access  Private
 */
export const getHouseholdQRData = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('householdId');

    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 404));
    }

    const qrDataURL = await generateHouseholdQR(
        user.householdId._id,
        user.householdId.address || 'My Household',
        true
    );

    res.status(200).json({
        status: 'success',
        data: {
            qrCode: qrDataURL,
            householdId: user.householdId._id,
            address: user.householdId.address
        }
    });
});

/**
 * @desc    Download QR code as PNG
 * @route   GET /api/v1/users/household/qr/download
 * @access  Private
 */
export const downloadHouseholdQR = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('householdId');

    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 404));
    }

    // Generate QR as buffer (PNG)
    const qrBuffer = await generateHouseholdQR(
        user.householdId._id,
        user.householdId.address || 'My Household',
        false
    );

    // Set headers for download
    const filename = `household-qr-${user.householdId._id}-${Date.now()}.png`;
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', qrBuffer.length);

    res.send(qrBuffer);
});

/**
 * @desc    Get QR token info
 * @route   GET /api/v1/users/household/qr-token
 * @access  Private
 */
export const getQRToken = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('householdId');

    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            token: user.householdId.qrToken,
            generatedAt: user.householdId.qrGeneratedAt,
            expiresAt: user.householdId.qrGeneratedAt ?
                new Date(user.householdId.qrGeneratedAt.getTime() + 30 * 24 * 60 * 60 * 1000) : null
        }
    });
});

/**
 * @desc    Regenerate QR token
 * @route   POST /api/v1/users/household/qr/regenerate
 * @access  Private
 */
export const regenerateQR = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('householdId');

    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 404));
    }

    const result = await regenerateQRToken(user.householdId._id);

    res.status(200).json({
        status: 'success',
        message: 'QR token regenerated successfully',
        data: result
    });
});

/**
 * @desc    Join household by scanning QR
 * @route   POST /api/v1/users/household/join
 * @access  Private
 */
export const joinHouseholdByQR = catchAsync(async (req, res, next) => {
    const { householdId, token } = req.body;

    if (!householdId || !token) {
        return next(new AppError('Please provide householdId and token', 400));
    }

    // Verify token
    const isValid = await verifyQRToken(householdId, token);
    if (!isValid) {
        return next(new AppError('Invalid or expired QR code', 400));
    }

    // Check if user already has a household
    const currentUser = await User.findById(req.user.id);
    if (currentUser.householdId) {
        return next(new AppError('You are already part of a household. Leave current household first.', 400));
    }

    // Check if household exists
    const household = await Household.findById(householdId);
    if (!household) {
        return next(new AppError('Household not found', 404));
    }

    // Update user's household
    currentUser.householdId = householdId;
    await currentUser.save();

    // Get updated user with populated household
    const updatedUser = await User.findById(req.user.id).populate('householdId');

    res.status(200).json({
        status: 'success',
        message: 'Successfully joined household',
        data: {
            user: updatedUser,
            household: household
        }
    });
});

/**
 * @desc    Leave current household
 * @route   POST /api/v1/users/household/leave
 * @access  Private
 */
export const leaveHousehold = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user.householdId) {
        return next(new AppError('You are not part of any household', 400));
    }

    // Store household info for response
    const oldHouseholdId = user.householdId;

    // Remove user from household
    user.householdId = null;
    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'Successfully left household',
        data: {
            previousHouseholdId: oldHouseholdId
        }
    });
});

/**
 * @desc    Validate QR code (for scanning apps)
 * @route   POST /api/v1/public/validate-qr
 * @access  Public
 */
export const validateQRCode = catchAsync(async (req, res, next) => {
    const { qrData } = req.body;

    try {
        // Parse QR data
        const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;

        // Validate structure
        if (data.type !== 'household' || !data.id || !data.token) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid QR code format'
            });
        }

        // Verify token
        const isValid = await verifyQRToken(data.id, data.token);

        if (isValid) {
            // Get household info
            const household = await Household.findById(data.id).select('address size type');

            res.status(200).json({
                status: 'success',
                data: {
                    valid: true,
                    householdId: data.id,
                    household: household,
                    address: data.address
                }
            });
        } else {
            res.status(200).json({
                status: 'success',
                data: {
                    valid: false,
                    message: 'QR code is invalid or expired'
                }
            });
        }
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid QR code format'
        });
    }
});