const Joi = require("joi");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

const AppError = require("../../core/appError");

const createSchema = Joi.object({
    title: Joi.string().min(2).required(),
    slug: Joi.string().optional(),
    description: Joi.string().allow("", null),
    shortDescription: Joi.string().allow("", null),
    brand: Joi.string().allow("", null),
    categories: Joi.array()
        .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
        .optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    attributes: Joi.object().optional(),
    variants: Joi.array()
        .items(
            Joi.object({
                sku: Joi.string().required(),
                attributes: Joi.object().optional(),
                price: Joi.number().required(),
                mrp: Joi.number().optional(),
                stock: Joi.number().optional(),
            })
        )
        .optional(),
});

const updateSchema = Joi.object({
    title: Joi.string().min(2).optional(),
    slug: Joi.string().optional(),
    description: Joi.string().allow("", null),
    shortDescription: Joi.string().allow("", null),
    brand: Joi.string().allow("", null),
    categories: Joi.array()
        .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
        .optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    attributes: Joi.object().optional(),
    variants: Joi.array()
        .items(
            Joi.object({
                _id: Joi.string().optional(),
                sku: Joi.string().optional(),
                attributes: Joi.object().optional(),
                price: Joi.number().optional(),
                mrp: Joi.number().optional(),
                stock: Joi.number().optional(),
            })
        )
        .optional(),
});

const reviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().allow("", null),
});

function validateBody(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const message = error.details.map((d) => d.message).join(", ");
            return next(new AppError(message, 400));
        }
        req.body = value;
        return next();
    };
}

/* simple adminOnly using req.attachedSECRET.userId role - adapt to your rbac middleware */
function adminOnly(req, res, next) {
    const user = req.attachedSECRET.userId || {};
    if (!user.role || (user.role !== "admin" && user.role !== "seller")) {
        return next(new AppError("Forbidden", 403));
    }
    next();
}

module.exports = {
    validateReview: validateBody(reviewSchema),
    validateCreate: validateBody(createSchema),
    validateUpdate: validateBody(updateSchema),
    uploadImages: upload.array("images", 10),
    adminOnly,
};
