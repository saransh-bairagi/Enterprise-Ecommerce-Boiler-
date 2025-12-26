// src/middlewares/validation.js
const Joi = require('joi');

/**
 * validateBody(schema) -> validates req.body
 * validateParams(schema) -> validates req.params
 * validateQuery(schema) -> validates req.query
 */

const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors,
    });
  }
  next();
};

const validateParams = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.params, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors,
    });
  }
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors,
    });
  }
  next();
};

module.exports = { validateBody, validateParams, validateQuery };
