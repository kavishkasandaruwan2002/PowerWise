import QRCode from 'qrcode';
import crypto from 'crypto';
import Household from '../models/Household.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

/**
 * Generate a unique token for household QR
 * @returns {string} Unique token
 */
export const generateQRToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate QR code for household
 * @param {string} householdId - Household ID
 * @param {string} householdAddress - Household address for display
 * @param {boolean} returnAsDataURL - Return as data URL or buffer
 * @returns {Promise<string|Buffer>} QR code
 */
export const generateHouseholdQR = async (householdId, householdAddress, returnAsDataURL = true) => {
    try {
        // Find household
        const household = await Household.findById(householdId);
        if (!household) {
            throw new AppError('Household not found', 404);
        }

        // Generate or get existing token
        let qrToken = household.qrToken;
        if (!qrToken) {
            qrToken = generateQRToken();
            household.qrToken = qrToken;
            household.qrGeneratedAt = new Date();
            await household.save();
        }

        // Create QR code data
        const qrData = JSON.stringify({
            type: 'household',
            id: householdId.toString(),
            token: qrToken,
            address: householdAddress.substring(0, 30) + (householdAddress.length > 30 ? '...' : ''),
            timestamp: Date.now(),
            version: '1.0'
        });

        // QR Code options
        const options = {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 300,
            color: {
                dark: '#2563eb',
                light: '#ffffff'
            }
        };

        if (returnAsDataURL) {
            return await QRCode.toDataURL(qrData, options);
        } else {
            return await QRCode.toBuffer(qrData, options);
        }
    } catch (error) {
        console.error('QR Generation Error:', error);
        throw new AppError('Error generating QR code', 500);
    }
};

/**
 * Verify QR token
 * @param {string} householdId - Household ID
 * @param {string} token - QR token to verify
 * @returns {Promise<boolean>} Is valid
 */
export const verifyQRToken = async (householdId, token) => {
    const household = await Household.findById(householdId);
    if (!household) return false;

    if (!household.qrToken || household.qrToken !== token) {
        return false;
    }

    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (household.qrGeneratedAt && (Date.now() - household.qrGeneratedAt > thirtyDays)) {
        return false;
    }

    return true;
};

/**
 * Regenerate QR token for household
 * @param {string} householdId - Household ID
 * @returns {Promise<Object>} New token
 */
export const regenerateQRToken = async (householdId) => {
    const household = await Household.findById(householdId);
    if (!household) {
        throw new AppError('Household not found', 404);
    }

    const newToken = generateQRToken();
    household.qrToken = newToken;
    household.qrGeneratedAt = new Date();
    await household.save();

    return {
        token: newToken,
        generatedAt: household.qrGeneratedAt
    };
};

/**
 * Get QR code as HTML for display
 * @param {string} householdId - Household ID
 * @param {string} address - Household address
 * @param {string} authToken - Authentication token to include
 * @returns {Promise<string>} HTML page
 */
export const getQRCodeHTML = async (householdId, address, authToken) => {
    const qrDataURL = await generateHouseholdQR(householdId, address, true);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Household QR Code - PowerGuard</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
            }
            h1 {
                color: #2563eb;
                margin-bottom: 10px;
                font-size: 32px;
            }
            .subtitle {
                color: #666;
                margin-bottom: 30px;
                font-size: 16px;
            }
            .qr-container {
                background: #f8fafc;
                padding: 30px;
                border-radius: 15px;
                margin: 20px 0;
                border: 2px dashed #2563eb;
            }
            .qr-image {
                width: 300px;
                height: 300px;
                margin: 0 auto;
                display: block;
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .address-box {
                background: #eef2ff;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                font-size: 18px;
                color: #1e40af;
                font-weight: 500;
            }
            .instructions {
                text-align: left;
                background: #f9f9f9;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .instructions h3 {
                color: #2563eb;
                margin-top: 0;
            }
            .instructions ol {
                margin: 10px 0;
                padding-left: 20px;
                color: #555;
                line-height: 1.8;
            }
            .download-btn {
                display: inline-block;
                background: #2563eb;
                color: white;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-weight: 600;
                margin: 10px 5px;
                transition: background 0.3s;
                border: none;
                cursor: pointer;
            }
            .download-btn:hover {
                background: #1e40af;
            }
            .print-btn {
                background: #10b981;
            }
            .print-btn:hover {
                background: #059669;
            }
            .footer {
                margin-top: 30px;
                color: #999;
                font-size: 14px;
            }
            .token-info {
                background: #fff3cd;
                border: 1px solid #ffeeba;
                padding: 10px;
                border-radius: 5px;
                margin: 20px 0;
                font-size: 12px;
                color: #856404;
                word-break: break-all;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>⚡ PowerGuard</h1>
            <div class="subtitle">Household QR Code</div>
            
            <div class="address-box">
                📍 ${address || 'No address specified'}
            </div>
            
            <div class="qr-container">
                <img src="${qrDataURL}" alt="Household QR Code" class="qr-image">
            </div>
            
            <div class="instructions">
                <h3>📋 How to use this QR code:</h3>
                <ol>
                    <li>Share this QR code with family members</li>
                    <li>They can scan it to join your household</li>
                    <li>Each QR code is unique and secure</li>
                    <li>Valid for 30 days (regenerate if expired)</li>
                </ol>
            </div>
            
            <div>
                <button onclick="downloadQR()" class="download-btn">📥 Download QR Code</button>
                <button onclick="window.print()" class="download-btn print-btn">🖨️ Print</button>
            </div>
            
            <div class="token-info" id="tokenInfo">
                Loading token information...
            </div>
            
            <div class="footer">
                Generated on ${new Date().toLocaleString()}<br>
                PowerGuard - Smart Energy Management
            </div>
        </div>
        
        <script>
            async function downloadQR() {
                const img = document.querySelector('.qr-image');
                const link = document.createElement('a');
                link.download = 'household-qr-${Date.now()}.png';
                link.href = img.src;
                link.click();
            }
            
            // Fetch token from server using the token we passed
            fetch('/api/v1/users/household/qr-token', {
                headers: {
                    'Authorization': 'Bearer ${authToken}'
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    document.getElementById('tokenInfo').innerHTML = 
                        '🔑 QR Token: <strong>' + data.data.token + '</strong><br>' +
                        '📅 Generated: ' + new Date(data.data.generatedAt).toLocaleString() + '<br>' +
                        '⏰ Expires: ' + (data.data.expiresAt ? new Date(data.data.expiresAt).toLocaleString() : 'N/A');
                } else {
                    document.getElementById('tokenInfo').innerHTML = '❌ Failed to load token';
                }
            })
            .catch(err => {
                console.error('Error fetching token:', err);
                document.getElementById('tokenInfo').innerHTML = '❌ Error loading token';
            });
        </script>
    </body>
    </html>
    `;
};