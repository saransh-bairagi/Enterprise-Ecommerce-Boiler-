// src/middlewares/errorHandler.js

const logger = require("../config/logger");

// Global error handler
const errorHandler = (err, req, res, next) => {
  console.log(err); // Log error stack for debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  if(statusCode === 500){
    console.error(err.stack);
    logger.error(err.message, { statusCode });
  }
  // For validation errors or mongoose errors, you can customize
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
      errors: err.errors,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please login again.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Token expired. Please login again.',
    });
  }

  // Default error response
  res.status(statusCode).json({
    status: 'error',
    message,
  });
};

module.exports = errorHandler;
