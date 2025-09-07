const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { pool } = require('../config/database');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Verify user still exists and is active
    const [users] = await pool.execute(
      'SELECT id, rfid_card_id, first_name, last_name, user_type, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }
    
    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Check if user is staff or admin
const requireStaff = (req, res, next) => {
  if (!['staff', 'admin'].includes(req.user.user_type)) {
    return res.status(403).json({
      success: false,
      message: 'Staff or admin access required'
    });
  }
  next();
};

// Check if user is student
const requireStudent = (req, res, next) => {
  if (req.user.user_type !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Student access required'
    });
  }
  next();
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const [users] = await pool.execute(
      'SELECT id, rfid_card_id, first_name, last_name, user_type, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length > 0 && users[0].is_active) {
      req.user = users[0];
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireStaff,
  requireStudent,
  optionalAuth
};
