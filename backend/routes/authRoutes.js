const express = require('express');
const { body } = require('express-validator');
const { register, registerAdmin, login, logout, getMe, updatePassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('incomeBracket').isIn(['low', 'middle', 'high']).withMessage('Income bracket must be low, middle, or high'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [🔐 Auth]
 *     summary: Register a new user (regular)
 *     description: Create a new user account with income bracket. Always creates a normal user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             NormalUser:
 *               summary: Regular user
 *               value:
 *                 name: Kasun Perera
 *                 email: kasun@gmail.com
 *                 password: password123
 *                 incomeBracket: middle
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post('/register', ...registerValidation, register);

/**
 * @swagger
 * /api/auth/register-admin:
 *   post:
 *     tags: [🔐 Auth]
 *     summary: Register a new admin (requires secret key)
 *     description: |
 *       Create a new admin account. You must provide a valid `adminKey` (matching the server's `ADMIN_SECRET_KEY`).
 *       This endpoint is separate from regular user registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - incomeBracket
 *               - adminKey
 *             properties:
 *               name:
 *                 type: string
 *                 example: Admin User
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@tracker.lk
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: admin123
 *               incomeBracket:
 *                 type: string
 *                 enum: [low, middle, high]
 *                 example: high
 *               adminKey:
 *                 type: string
 *                 description: Secret key to create admin accounts
 *                 example: my_super_secret_admin_key_123
 *           examples:
 *             AdminRegistration:
 *               summary: Admin registration
 *               value:
 *                 name: Admin User
 *                 email: admin@tracker.lk
 *                 password: admin123
 *                 incomeBracket: high
 *                 adminKey: my_super_secret_admin_key_123
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Invalid or missing admin key
 *       409:
 *         description: Email already registered
 */
router.post('/register-admin', ...registerValidation, registerAdmin);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [🔐 Auth]
 *     summary: Login and receive JWT token
 *     description: |
 *       Login with your email and password.
 *       **Copy the returned token**, then click 🔒 **Authorize** at the top and enter `Bearer YOUR_TOKEN`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             NormalUser:
 *               summary: Normal user
 *               value:
 *                 email: kasun@gmail.com
 *                 password: password123
 *             AdminUser:
 *               summary: Admin user
 *               value:
 *                 email: admin@tracker.lk
 *                 password: admin123
 *     responses:
 *       200:
 *         description: Login successful — copy the token!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', ...loginValidation, login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [🔐 Auth]
 *     summary: Get current user profile
 *     description: Returns the authenticated user's full profile including linked household.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Not authenticated
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [🔐 Auth]
 *     summary: Logout current user
 *     description: JWT is stateless — this confirms logout. Remove the token on your client.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', protect, logout);

/**
 * @swagger
 * /api/auth/update-password:
 *   put:
 *     tags: [🔐 Auth]
 *     summary: Update password
 *     description: Change the current user's password. Returns a new JWT token.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated with new token
 *       401:
 *         description: Current password incorrect
 */
router.put('/update-password', protect, updatePassword);

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     tags: [🔐 Auth]
 *     summary: Update current user profile
 *     description: Update name, email, or income bracket. Email must be unique.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Kasun Perera Updated
 *               email:
 *                 type: string
 *                 format: email
 *                 example: kasun.new@example.com
 *               incomeBracket:
 *                 type: string
 *                 enum: [low, middle, high]
 *                 example: high
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Invalid income bracket
 *       409:
 *         description: Email already in use
 */
router.put('/me', protect, updateProfile);

module.exports = router;