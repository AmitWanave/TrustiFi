const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Protect routes - require valid JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    if (req.user.isBanned) {
      res.status(403);
      throw new Error('Your account has been banned. Contact support.');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401);
      throw new Error('Not authorized, invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Not authorized, token expired');
    }
    throw error;
  }
});

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied. Role '${req.user?.role}' is not authorized for this action.`
      );
    }
    next();
  };
};

// Admin only shorthand
const adminOnly = authorize('admin');

// Seller or admin
const sellerOrAdmin = authorize('seller', 'admin');

// Inspector or admin
const inspectorOrAdmin = authorize('inspector', 'admin');

module.exports = { protect, authorize, adminOnly, sellerOrAdmin, inspectorOrAdmin };
