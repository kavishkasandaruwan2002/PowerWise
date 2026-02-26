const jwt = require('jsonwebtoken');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.header('x-auth-token')) {
        // Set token from x-auth-token header
        token = req.header('x-auth-token');
    }

    // Check if not token
    if (!token) {
        // DEVELOPMENT OVERRIDE: If no token is provided, we can simulate a user for testing purposes
        if (process.env.NODE_ENV === 'development') {
            req.user = {
                id: '65c23b12a8b9c8d7e6f5a4b3',
                role: 'USER',
                householdId: '65c23b12a8b9c8d7e6f5a4c1',
                location: {
                    lat: 6.9271,   // Colombo
                    lon: 79.8612
                }
            };
            return next();
        }
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        // Payload: { id, email, role, householdId }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Verify household ownership
exports.checkOwnership = (req, res, next) => {
    // Admins can bypass ownership check
    if (req.user.role === 'ADMIN') {
        return next();
    }

    const requestedHouseholdId = req.params.householdId || req.body.householdId;

    if (requestedHouseholdId && req.user.householdId !== requestedHouseholdId) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access data for this household'
        });
    }
    next();
};
