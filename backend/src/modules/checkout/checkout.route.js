const router = require('express').Router();

const CheckoutController = require('./checkout.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');

// ----------------------------------------------------------
// USER-FACING ROUTES (LOGGED-IN)
// ----------------------------------------------------------

// Get checkout summary
router.get('/summary', auth, CheckoutController.getSummary);

// Validate checkout
router.post('/validate', auth, CheckoutController.validate);

// Process checkout
router.post('/process', auth, CheckoutController.process);

// Apply coupon at checkout
router.post('/coupon', auth, CheckoutController.applyCoupon);

// Validate payment
router.post('/payment/validate', auth, CheckoutController.validatePayment);

module.exports = router;
