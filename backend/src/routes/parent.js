// src/routes/parent.js
const express = require('express');
const router = express.Router();

/**
 * CORE MODULES ROUTES
 */

// Cart
router.use('/cart', require('../modules/cart/cart.route'));

// Order
router.use('/orders', require('../modules/order/order.route'));

// Checkout
router.use('/checkout', require('../modules/checkout/checkout.route'));

// Coupons/Discounts
router.use('/coupons', require('../modules/coupons/coupon.route'));

// Inventory/Stock
router.use('/inventory', require('../modules/inventory/stock/stock.route'));

// Reviews
router.use('/reviews', require('../modules/reviews/review.route'));

// Shipping (includes Delhivery provider under /shipping/delhivery)
router.use('/shipping', require('../modules/shipping/shipment.route'));

// Promotions
router.use('/promo', require('../modules/promo/promo.route'));

// Returns/Refunds
router.use('/returns', require('../modules/returns/return.route'));

/**
 * OPTIONAL MODULES ROUTES
 */

// Notifications
router.use('/notifications', require('../modules/notification/notification.route'));

// Payments
router.use('/payments', require('../modules/payment/payment.route'));

// Analytics (Admin only)
router.use('/analytics', require('../modules/analytics/analytics.route'));

// Search
router.use('/search', require('../modules/search/search.route'));

// Catalog (Categories & Attributes)
router.use('/catalog', require('../modules/catalog/catalog.route'));

// Pricing
router.use('/pricing', require('../modules/pricing/pricing.route'));

// Authentication (OAuth, MFA, Sessions)
router.use('/auth', require('../modules/auth/auth.route'));

// CMS (Pages & Blog)
router.use('/cms', require('../modules/cms/cms.route'));

/**
 * EXISTING MODULES ROUTES
 */

// Products
router.use('/products', require('../modules/products/product.route'));

// Users
router.use('/users', require('../modules/user/user.route'));

module.exports = router;
