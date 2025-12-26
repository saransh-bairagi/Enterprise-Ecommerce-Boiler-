const router = require('express').Router();

const { PromoController, PromoAdminController } = require('./promo.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');

// ----------------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------------

// Get promo details
router.get('/:publicId', PromoController.getPromo);

// List active promos
router.get('/', PromoController.listActive);

// Track click
router.post('/:publicId/click', PromoController.trackClick);

// Track impression
router.post('/:publicId/impression', PromoController.trackImpression);

// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN)
// ----------------------------------------------------------

/**
 * CREATE PROMO
 */
router.post('/admin', auth, rbac('admin'), PromoAdminController.create);

/**
 * UPDATE PROMO
 */
router.put('/admin/:publicId', auth, rbac('admin'), PromoAdminController.update);

/**
 * DELETE PROMO (Soft Delete)
 */
router.delete(
  '/admin/:publicId',
  auth,
  rbac('admin'),
  PromoAdminController.delete
);

/**
 * RESTORE PROMO
 */
router.patch(
  '/admin/:publicId/restore',
  auth,
  rbac('admin'),
  PromoAdminController.restore
);

/**
 * LIST PROMOS (Admin)
 */
router.get('/admin/list', auth, rbac('admin'), PromoAdminController.list);

module.exports = router;
