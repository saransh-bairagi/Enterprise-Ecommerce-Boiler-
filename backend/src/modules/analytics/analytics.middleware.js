const Joi = require('joi');
const AppError = require('../../core/appError');


// Body validation (for future analytics creation endpoints)
const createSchema = Joi.object({
  type: Joi.string().required(),
  data: Joi.object().required(),
  userId: Joi.string().optional(),
});

// Query validation schemas for analytics endpoints
const dateRangeQuerySchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const topProductsQuerySchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const aggregationQuerySchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  groupBy: Joi.string().valid('day', 'week', 'month').optional(),
});

function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      return next(new AppError(message, 400));
    }
    req.query = value;
    next();
  };
}

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      return next(new AppError(message, 400));
    }
    req.body = value;
    next();
  };
}

module.exports = {
  validateCreate: validateBody(createSchema),
  validateDateRangeQuery: validateQuery(dateRangeQuerySchema),
  validateTopProductsQuery: validateQuery(topProductsQuerySchema),
  validateAggregationQuery: validateQuery(aggregationQuerySchema),
};
