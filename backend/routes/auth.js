const express = require('express');
const AuthService = require('../services/authService');
const { validate, schemas } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', 
  validate(schemas.register),
  asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  })
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  validate(schemas.login),
  asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body.email, req.body.password);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  })
);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile',
  verifyToken,
  asyncHandler(async (req, res) => {
    const user = await AuthService.getProfile(req.userId);
    
    res.json({
      success: true,
      data: { user }
    });
  })
);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout',
  verifyToken,
  asyncHandler(async (req, res) => {
    // In JWT, logout is handled client-side by removing the token
    // Here we can log the logout event or invalidate refresh tokens if implemented
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  })
);

module.exports = router;
