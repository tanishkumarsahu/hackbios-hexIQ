const config = require('../config');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error response
  let error = {
    success: false,
    message: 'Internal server error',
    ...(config.isDevelopment() && { stack: err.stack })
  };
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation error';
    error.statusCode = 400;
  } else if (err.name === 'UnauthorizedError') {
    error.message = 'Unauthorized access';
    error.statusCode = 401;
  } else if (err.name === 'ForbiddenError') {
    error.message = 'Forbidden access';
    error.statusCode = 403;
  } else if (err.name === 'NotFoundError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  } else if (err.name === 'ConflictError') {
    error.message = 'Resource conflict';
    error.statusCode = 409;
  } else if (err.code === '23505') { // PostgreSQL unique violation
    error.message = 'Resource already exists';
    error.statusCode = 409;
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    error.message = 'Referenced resource not found';
    error.statusCode = 400;
  }
  
  const statusCode = error.statusCode || err.statusCode || 500;
  
  res.status(statusCode).json(error);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation error') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError
};
