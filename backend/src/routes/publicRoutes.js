import express from 'express';
import { validateQRCode } from '../controllers/qrController.js';

const router = express.Router();

/**
 * @swagger
 * /public/validate-qr:
 *   post:
 *     summary: Validate QR code (public endpoint for scanning apps)
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrData:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validation result
 */
router.post('/validate-qr', validateQRCode);

export default router;