const router = require('express').Router();

const { CartController, CartAdminController } = require('./cart.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');
const CartMiddleware = require('./cart.middleware');

// ----------------------------------------------------------
// USER-FACING ROUTES (LOGGED-IN)
// ----------------------------------------------------------

// Get user's cart
router.get('/', auth, CartController.getCart);

// Add item to cart
router.post('/items', auth, CartController.addItem);

// Remove item from cart
router.delete('/items/:sku', auth, CartController.removeItem);

// Update item quantity
router.put('/items/:sku', auth, CartController.updateItemQuantity);

// Clear entire cart
router.delete('/', auth, CartController.clearCart);

// Apply coupon
router.post('/coupon', auth, CartController.applyCoupon);

// Remove coupon
router.delete('/coupon', auth, CartController.removeCoupon);

// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN)
// ----------------------------------------------------------

/**
 * CREATE CART
 */
router.post('/admin', auth, rbac('admin'), CartMiddleware.validateCreate, CartAdminController.create);

/**
 * UPDATE CART
 */
router.put('/admin/:publicId', auth, rbac('admin'), CartMiddleware.validateUpdate, CartAdminController.update);

/**
 * DELETE CART (Soft Delete)
 */
router.delete('/admin/:publicId', auth, rbac('admin'), CartAdminController.delete);

/**
 * RESTORE CART
 */
router.patch(
  '/admin/:publicId/restore',
  auth,
  rbac('admin'),
  CartAdminController.restore
);

/**
 * LIST CARTS (Admin)
 */
router.get('/admin/list', auth, rbac('admin'), CartAdminController.list);

module.exports = router;
