const Joi = require('joi');
const multer = require('multer');
const AppError = require('../../core/appError');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

/**
 * Validation schemas
 */
const createSchema = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin', 'seller').optional(),
});

const updateSchema = Joi.object({
  firstName: Joi.string().min(2).optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('user', 'admin', 'seller').optional(),
  visible: Joi.boolean().optional()
});

/**
 * Middleware to validate request body
 */
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

/**
 * Simple role check middleware
 */
function adminOnly(req, res, next) {
  const user = req.attachedSECRET.userId || {};
  if (!user.role || (user.role !== 'admin' && user.role !== 'seller')) {
    return next(new AppError('Forbidden', 403));
  }
  next();
}

module.exports = {
  validateCreate: validateBody(createSchema),
  validateUpdate: validateBody(updateSchema),
  adminOnly,
  uploadAvatar: upload.single('avatar'), // if you want users to upload profile pics
};
