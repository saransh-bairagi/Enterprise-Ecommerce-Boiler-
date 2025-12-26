const router = require("express").Router();

const { UserController, ProductAdminController } = require("./product.controller");

const {auth} = require("../../common middlewares/auth");
const {rbac} = require("../../common middlewares/rbac");

const ProductMiddleware = require("./product.middleware");

// ----------------------------------------------------------
// USER-FACING ROUTES (PUBLIC)
// ----------------------------------------------------------

// List products
router.get("/", UserController.list);

// Search products
router.get("/search", UserController.search);

// Get product by slug (slug is unique)
router.get("/:slug", UserController.getBySlug);


// Add review (only logged-in)
router.post("/:slug/reviews", auth,ProductMiddleware.validateReview, UserController.addReviewBySlug);
 
// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN / SELLER)
// ----------------------------------------------------------

/**
 * CREATE PRODUCT
 * - auth
 * - role check
 * - image upload
 * - validate create payload
 */
router.post(
    "/",
    auth,
    rbac("admin"),
    ProductMiddleware.uploadImages,
    ProductMiddleware.validateCreate,
    ProductAdminController.create
);

/**
 * UPDATE PRODUCT (by _id or publicId? always _id when admin)
 */
router.put(
    "/:publicId",
    auth,
    rbac("admin"),
    ProductMiddleware.uploadImages,
    ProductMiddleware.validateUpdate,
    ProductAdminController.update
);

/**
 * DELETE PRODUCT (Soft Delete)
 */
router.delete("/:publicId", auth, rbac("admin"), ProductAdminController.delete);

/**
 * RESTORE PRODUCT
 */
router.patch("/:publicId/restore", auth, rbac("admin"), ProductAdminController.restore);

/**
 * ADJUST STOCK (variant or main sku)
 */
router.patch("/:publicId/stock", auth, rbac("admin"), ProductAdminController.adjustStock);

/**
 * UPDATE A SPECIFIC VARIANT
 */
router.patch(
    "/:publicId/variant",
    auth,
    rbac("admin"),
    ProductAdminController.updateVariant
);

/**
 * BULK CREATE
 */
router.post("/bulk", auth, rbac("admin"), ProductAdminController.bulkCreate);

/**
 * UPLOAD IMAGES FOR EXISTING PRODUCT
 */
router.post(
    "/:publicId/images",
    auth,
    rbac("admin"),
    ProductMiddleware.uploadImages,
    ProductAdminController.uploadImages
);

module.exports = router;
