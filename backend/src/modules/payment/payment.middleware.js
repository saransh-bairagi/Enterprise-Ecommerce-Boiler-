const Joi = require('joi');
const AppError = require('../../core/appError');

const initiateSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().min(0.01).required(),
  userId: Joi.string().required(),
  provider: Joi.string().valid('razorpay').required(),
});

const processSchema = Joi.object({
  providerResponse: Joi.object({
    id: Joi.string().required(),
    status: Joi.string().required(),
    amount: Joi.number().required(),
    // Add more fields as needed
  }).required(),
});

const refundSchema = Joi.object({
  amount: Joi.number().min(0.01).required(),
  reason: Joi.string().optional(),
});

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
  validateInitiate: validateBody(initiateSchema),
  validateProcess: validateBody(processSchema),
  validateRefund: validateBody(refundSchema),
};
