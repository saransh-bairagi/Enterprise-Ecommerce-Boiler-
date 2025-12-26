const router = require('express').Router();

const { PaymentController, PaymentAdminController } = require('./payment.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');
const PaymentMiddleware = require('./payment.middleware');

// ----------------------------------------------------------
// USER-FACING ROUTES (LOGGED-IN)
// ----------------------------------------------------------

/**
 * GET PAYMENT STATUS
 */
router.get('/:transactionId', auth, PaymentController.getStatus);

/**
 * GET ORDER PAYMENT
 */
router.get('/order/:orderId', auth, PaymentController.getByOrder);

/**
 * GET USER PAYMENTS
 */
router.get('/', auth, PaymentController.getUserPayments);

// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN)
// ----------------------------------------------------------

/**
 * INITIATE PAYMENT
 */
router.post(
  '/admin/initiate',
  auth,
  rbac('admin'),
  PaymentMiddleware.validateInitiate,
  PaymentAdminController.initiatePayment
);

/**
 * PROCESS PAYMENT (WEBHOOK)
 */
router.post(
  '/admin/:transactionId/process',
  auth,
  rbac('admin'),
  PaymentMiddleware.validateProcess,
  PaymentAdminController.processPayment
);

/**
 * INITIATE REFUND
 */
router.post(
  '/admin/:transactionId/refund',
  auth,
  rbac('admin'),
  PaymentMiddleware.validateRefund,
  PaymentAdminController.initiateRefund
);

/**
 * GET PAYMENT (Admin)
 */
router.get('/admin/:id', auth, rbac('admin'), PaymentAdminController.getPayment);

/**
 * LIST PAYMENTS (Admin)
 */
router.get('/admin', auth, rbac('admin'), PaymentAdminController.listPayments);

/**
 * GET PAYMENTS BY STATUS
 */
router.get(
  '/admin/status/:status',
  auth,
  rbac('admin'),
  PaymentAdminController.getByStatus
);

/**
 * UPDATE PAYMENT STATUS
 */
router.patch(
  '/admin/:id/status',
  auth,
  rbac('admin'),
  PaymentAdminController.updateStatus
);

/**
 * DELETE PAYMENT
 */
router.delete(
  '/admin/:id',
  auth,
  rbac('admin'),
  PaymentAdminController.deletePayment
);

// ----------------------------------------------------------
// RAZORPAY ROUTES
// ----------------------------------------------------------

/**
 * CREATE RAZORPAY ORDER
 * POST /payments/razorpay/create-order
 */
router.post(
  '/razorpay/create-order',
  auth,
  PaymentController.createRazorpayOrder
);

/**
 * VERIFY RAZORPAY PAYMENT
 * POST /payments/razorpay/verify
 */
router.post(
  '/razorpay/verify',
  auth,
  PaymentController.verifyRazorpayPayment
);

/**
 * RAZORPAY WEBHOOK
 * POST /admin/payments/razorpay/webhook
 */
router.post(
  '/admin/razorpay/webhook',
  PaymentAdminController.razorpayWebhook
);

/**
 * CREATE RAZORPAY REFUND
 * POST /admin/payments/razorpay/:paymentId/refund
 */
router.post(
  '/admin/razorpay/:paymentId/refund',
  auth,
  rbac('admin'),
  PaymentAdminController.createRazorpayRefund
);

module.exports = router;
