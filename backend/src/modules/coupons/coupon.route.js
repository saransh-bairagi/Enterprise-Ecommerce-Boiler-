const router = require('express').Router();

const { CouponController, CouponAdminController } = require('./coupon.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');

// ----------------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------------

// Get coupon details
router.get('/:code', CouponController.get);

// Validate coupon
router.post('/validate', CouponController.validate);

// Calculate discount
router.post('/calculate-discount', CouponController.calculateDiscount);

// List active coupons
router.get('/', CouponController.listActive);

// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN)
// ----------------------------------------------------------

/**
 * CREATE COUPON
 */
router.post('/admin', auth, rbac('admin'), CouponAdminController.create);

/**
 * UPDATE COUPON
 */
router.put('/admin/:publicId', auth, rbac('admin'), CouponAdminController.update);

/**
 * DELETE COUPON (Soft Delete)
 */
router.delete(
  '/admin/:publicId',
  auth,
  rbac('admin'),
  CouponAdminController.delete
);

/**
 * RESTORE COUPON
 */
router.patch(
  '/admin/:publicId/restore',
  auth,
  rbac('admin'),
  CouponAdminController.restore
);

/**
 * LIST COUPONS (Admin)
 */
router.get('/admin/list', auth, rbac('admin'), CouponAdminController.list);

module.exports = router;
