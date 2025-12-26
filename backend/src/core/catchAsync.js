const { sendError } = require('./response');

const catchAsync = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    const errors = err.errors || null;
    sendError(res, message, statusCode, errors);
  }
};

module.exports = catchAsync;
