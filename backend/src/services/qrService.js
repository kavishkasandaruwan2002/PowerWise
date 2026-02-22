import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate QR code for household
 * @param {string} householdId - Household ID
 * @param {string} householdAddress - Household address for display
 * @returns {Promise<string>} QR code data URL
 */
export const generateHouseholdQR = async (householdId, householdAddress) => {
    // Create a unique token for this household
    const qrToken = crypto.randomBytes(16).toString('hex');

    // Store token in household (you'd add this field to your model)
    // await Household.findByIdAndUpdate(householdId, { qrToken });

    // QR Code data - when scanned, it can:
    // 1. Open a join page
    // 2. Display household info
    // 3. Auto-fill household ID for joining
    const qrData = JSON.stringify({
        type: 'household',
        id: householdId,
        token: qrToken,
        address: householdAddress.substring(0, 20) + '...',
        timestamp: Date.now()
    });

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    return qrCodeDataURL;
};

/**
 * Verify QR token
 * @param {string} householdId - Household ID
 * @param {string} token - QR token
 * @returns {boolean} Is valid
 */
export const verifyQRToken = async (householdId, token) => {
    const household = await Household.findById(householdId);
    return household && household.qrToken === token;
};