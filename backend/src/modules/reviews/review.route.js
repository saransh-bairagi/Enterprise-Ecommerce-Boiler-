const router = require('express').Router();

const { ReviewController, ReviewAdminController } = require('./review.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');

// ----------------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------------

// Get product reviews
router.get('/product/:productId', ReviewController.getProductReviews);

// Get product rating
router.get('/product/:productId/rating', ReviewController.getProductRating);

// List all reviews
router.get('/', ReviewController.list);

// ----------------------------------------------------------
// USER-FACING ROUTES (LOGGED-IN)
// ----------------------------------------------------------

// Get user's reviews
router.get('/user', auth, ReviewController.getUserReviews);

// Mark review as helpful
router.post('/:id/helpful', ReviewController.markHelpful);

// Mark review as unhelpful
router.post('/:id/unhelpful', ReviewController.markUnhelpful);

// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN)
// ----------------------------------------------------------

/**
 * CREATE REVIEW
 */
router.post('/admin', auth, rbac('admin'), ReviewAdminController.create);

/**
 * APPROVE REVIEW
 */
router.patch(
  '/admin/:id/approve',
  auth,
  rbac('admin'),
  ReviewAdminController.approve
);

/**
 * REJECT REVIEW
 */
router.patch(
  '/admin/:id/reject',
  auth,
  rbac('admin'),
  ReviewAdminController.reject
);

/**
 * DELETE REVIEW (Soft Delete)
 */
router.delete('/admin/:id', auth, rbac('admin'), ReviewAdminController.delete);

/**
 * RESTORE REVIEW
 */
router.patch(
  '/admin/:id/restore',
  auth,
  rbac('admin'),
  ReviewAdminController.restore
);

/**
 * GET PENDING REVIEWS
 */
router.get(
  '/admin/pending',
  auth,
  rbac('admin'),
  ReviewAdminController.getPending
);

/**
 * LIST REVIEWS (Admin)
 */
router.get('/admin/list', auth, rbac('admin'), ReviewAdminController.list);

module.exports = router;
