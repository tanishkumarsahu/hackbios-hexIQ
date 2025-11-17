const Joi = require('joi');

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    // Replace the original data with validated data
    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required(),
    graduation_year: Joi.number().integer().min(1950).max(new Date().getFullYear() + 10).required(),
    degree: Joi.string().min(2).max(100).required(),
    major: Joi.string().min(2).max(100).optional()
  }),
  
  // User login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  // Password reset
  resetPassword: Joi.object({
    email: Joi.string().email().required()
  }),
  
  // Update profile
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    bio: Joi.string().max(500).optional(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-()]+$/).optional(),
    current_title: Joi.string().max(100).optional(),
    current_company: Joi.string().max(100).optional(),
    location: Joi.object({
      city: Joi.string().max(100).required(),
      state: Joi.string().max(100).optional(),
      country: Joi.string().max(100).required()
    }).optional(),
    social_links: Joi.object({
      linkedin: Joi.string().uri().optional(),
      twitter: Joi.string().uri().optional(),
      website: Joi.string().uri().optional()
    }).optional(),
    skills: Joi.array().items(Joi.string().max(50)).max(20).optional(),
    interests: Joi.array().items(Joi.string().max(50)).max(20).optional()
  }),
  
  // Query parameters
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('name', 'created_at', 'graduation_year').default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),
  
  // Search parameters
  search: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    graduation_year: Joi.number().integer().min(1950).max(new Date().getFullYear() + 10).optional(),
    location: Joi.string().max(100).optional(),
    skills: Joi.string().optional() // Comma-separated skills
  })
};

module.exports = {
  validate,
  schemas
};
