const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Protect: verify JWT ────────────────────────────────────────────────────
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    console.log(`AUTH MIDDLEWARE - URL: ${req.url} | TOKEN PRESENT: ${!!token}`);
    if (!token) {
        console.log('AUTH MIDDLEWARE - NO TOKEN PROVIDED');
        // DEVELOPMENT OVERRIDE...
        if (process.env.NODE_ENV === 'development') {
            console.log('AUTH MIDDLEWARE - USING DEV MOCK USER');
            req.user = {
                _id: '65c23b12a8b9c8d7e6f5a4b3',
                id: '65c23b12a8b9c8d7e6f5a4b3',
                role: 'user',
                household: '65c23b12a8b9c8d7e6f5a4c1',
                householdId: '65c23b12a8b9c8d7e6f5a4c1',
                location: {
                    lat: 6.9271,   // Colombo
                    lon: 79.8612
                }
            };
            return next();
        }
        return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        console.log('AUTH MIDDLEWARE - DECODED:', decoded);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            console.log('AUTH MIDDLEWARE - USER NOT FOUND IN DB FOR ID:', decoded.id);
            if (process.env.NODE_ENV === 'development') {
                console.log('AUTH MIDDLEWARE - USING DEV MOCK USER (USER NOT FOUND IN DB)');
                req.user = {
                    _id: '65c23b12a8b9c8d7e6f5a4b3',
                    id: '65c23b12a8b9c8d7e6f5a4b3',
                    role: 'user',
                    household: '65c23b12a8b9c8d7e6f5a4c1',
                    householdId: '65c23b12a8b9c8d7e6f5a4c1',
                    location: { lat: 6.9271, lon: 79.8612 }
                };
                return next();
            }
            return res.status(401).json({ success: false, message: 'User not found.' });
        }
        if (!req.user.isActive) {
            console.log('AUTH MIDDLEWARE - USER DEACTIVATED:', req.user.email);
            return res.status(401).json({ success: false, message: 'User deactivated.' });
        }
        console.log('AUTH MIDDLEWARE - SUCCESS FOR:', req.user.email);
        next();
    } catch (err) {
        console.log('AUTH MIDDLEWARE - ERROR:', err.message);
        if (process.env.NODE_ENV === 'development') {
            console.log('AUTH MIDDLEWARE - USING DEV MOCK USER (TOKEN INVALID)');
            req.user = {
                _id: '65c23b12a8b9c8d7e6f5a4b3',
                id: '65c23b12a8b9c8d7e6f5a4b3',
                role: 'user',
                household: '65c23b12a8b9c8d7e6f5a4c1',
                householdId: '65c23b12a8b9c8d7e6f5a4c1',
                location: { lat: 6.9271, lon: 79.8612 }
            };
            return next();
        }
        return res.status(401).json({ success: false, message: 'Token invalid.' });
    }
};

// ── Admin Only ─────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
    if (req.user?.role === 'admin') return next();
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
};

// ── Household Access ───────────────────────────────────────────────────────
const householdAccess = async (req, res, next) => {
    const Household = require('../models/Household');
    const household = await Household.findById(req.params.householdId || req.params.id);
    if (!household) {
        return res.status(404).json({ success: false, message: 'Household not found.' });
    }
    const userId = req.user._id.toString();
    const isOwner = household.owner.toString() === userId;
    const isMember = household.members.map((m) => m.toString()).includes(userId);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isMember && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Access denied. You do not belong to this household.' });
    }
    req.household = household;
    next();
};

// ── Authorize roles ────────────────────────────────────────────────────────
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user?.role || 'unknown'} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, adminOnly, householdAccess, authorize };