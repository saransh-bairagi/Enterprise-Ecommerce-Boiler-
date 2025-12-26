// src/core/appError.js

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // distinguish operational vs programming errors

    // Capture stack trace excluding constructor
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
