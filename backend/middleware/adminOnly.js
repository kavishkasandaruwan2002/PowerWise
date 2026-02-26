

const adminOnly = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has admin role
    if (!req.user.role || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};

module.exports = { adminOnly };