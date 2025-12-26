// src/core/response.js

/**
 * Standard success response
 * @param {Object} res - express response object
 * @param {any} data - response data
 * @param {string} message - optional message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

/**
 * Standard error response
 * @param {Object} res - express response object
 * @param {string} message - error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {any} errors - optional detailed errors
 */
const sendError = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  res.status(statusCode).json({
    status: 'fail',
    message,
    errors,
  });
};

module.exports = { sendSuccess, sendError };
