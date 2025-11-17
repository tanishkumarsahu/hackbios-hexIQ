const jwt = require('jsonwebtoken');
const config = require('../config');
const { supabaseAdmin } = require('../config/database');

// Verify JWT token middleware
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
    
    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Get user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single();
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Attach user to request object
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
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
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single();
    
    if (!error && user) {
      req.user = user;
      req.userId = user.id;
    }
    
    next();
  } catch (error) {
    // Silently continue without auth
    next();
  }
};

module.exports = {
  verifyToken,
  optionalAuth
};
