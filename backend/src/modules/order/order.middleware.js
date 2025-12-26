const Joi = require('joi');
const AppError = require('../../core/appError');

const createSchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required(),
    })
  ).min(1).required(),
  shippingAddress: Joi.string().required(),
  billingAddress: Joi.string().optional(),
  paymentMethod: Joi.string().required(),
  couponCode: Joi.string().optional(),
});

const updateSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required(),
    })
  ).min(1).optional(),
  shippingAddress: Joi.string().optional(),
  billingAddress: Joi.string().optional(),
  paymentMethod: Joi.string().optional(),
  couponCode: Joi.string().optional(),
  status: Joi.string().optional(),
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
  validateCreate: validateBody(createSchema),
  validateUpdate: validateBody(updateSchema),
};
