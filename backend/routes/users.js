const express = require('express');
const UserService = require('../services/userService');
const { validate, schemas } = require('../middleware/validation');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with pagination and filters
// @access  Public (with optional auth for personalized results)
router.get('/',
  optionalAuth,
  validate(schemas.pagination, 'query'),
  validate(schemas.search, 'query'),
  asyncHandler(async (req, res) => {
    const result = await UserService.getAllUsers(req.query);
    
    res.json({
      success: true,
      data: result
    });
  })
);

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search',
  validate(schemas.search, 'query'),
  asyncHandler(async (req, res) => {
    const { q: searchTerm, ...filters } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    // Parse skills if provided
    if (filters.skills) {
      filters.skills = filters.skills.split(',').map(skill => skill.trim());
    }

    const users = await UserService.searchUsers(searchTerm, filters);
    
    res.json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });
  })
);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Public
router.get('/stats',
  asyncHandler(async (req, res) => {
    const stats = await UserService.getUserStats();
    
    res.json({
      success: true,
      data: stats
    });
  })
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id',
  asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    
    res.json({
      success: true,
      data: { user }
    });
  })
);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (own profile only)
router.put('/:id',
  verifyToken,
  validate(schemas.updateProfile),
  asyncHandler(async (req, res) => {
    // Users can only update their own profile
    if (req.userId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const user = await UserService.updateUser(req.params.id, req.body);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  })
);

module.exports = router;
