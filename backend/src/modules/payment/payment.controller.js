const { catchAsync } = require('../../core/catchAsync');
const { sendSuccess, sendError } = require('../../core/response');
const { PaymentService, PaymentAdminService } = require('./payment.service');
const razorpay=require('./razorpay');
/**
 * PAYMENT CONTROLLER
 * Handles payment HTTP requests
 */

// ----------------------------------------------------------
// USER CONTROLLER
// ----------------------------------------------------------

const PaymentController = {
  /**
   * GET PAYMENT STATUS
   * GET /payments/:transactionId
   */
  getStatus: catchAsync(async (req, res) => {
    const { transactionId } = req.params;
    const payment = await PaymentService.getPaymentStatus(transactionId);
    sendSuccess(res, payment, 'Payment retrieved successfully', 200);
  }),

  /**
   * GET ORDER PAYMENT
   * GET /orders/:orderId/payment
   */
  getByOrder: catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const payment = await PaymentService.getPaymentByOrder(orderId);
    sendSuccess(res, payment, 'Order payment retrieved successfully', 200);
  }),

  /**
   * GET USER PAYMENTS
   * GET /payments
   */
  getUserPayments: catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const payments = await PaymentService.getUserPayments(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
    sendSuccess(res, payments, 'Payments retrieved successfully', 200);
  }),

  /**
   * CREATE RAZORPAY ORDER
   * POST /payments/razorpay/create-order
   */
  createRazorpayOrder: catchAsync(async (req, res) => {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return sendError(res, 'orderId and amount are required', 400);
    }

    const razorpayOrder = await PaymentService.createRazorpayOrder(
      orderId,
      amount,
      {
        userId: req.user.id,
        email: req.user.email,
      }
    );

    sendSuccess(res, razorpayOrder, 'Razorpay order created successfully', 201);
  }),

  /**
   * VERIFY RAZORPAY PAYMENT
   * POST /payments/razorpay/verify
   */
  verifyRazorpayPayment: catchAsync(async (req, res) => {
    const { paymentId, orderId, signature } = req.body;

    if (!paymentId || !orderId || !signature) {
      return sendError(
        res,
        'paymentId, orderId, and signature are required',
        400
      );
    }

    const paymentDetails = await PaymentService.verifyRazorpayPayment(
      paymentId,
      orderId,
      signature
    );

    sendSuccess(
      res,
      paymentDetails,
      'Payment verified successfully',
      200
    );
  }),
};

// ----------------------------------------------------------
// ADMIN CONTROLLER
// ----------------------------------------------------------

const PaymentAdminController = {
  /**
   * INITIATE PAYMENT
   * POST /admin/payments/initiate
   */
  initiatePayment: catchAsync(async (req, res) => {
    const { orderId, userId, amount, paymentMethod, provider } = req.body;

    if (!orderId || !userId || !amount || !paymentMethod) {
      return sendError(
        res,
        'Missing required fields: orderId, userId, amount, paymentMethod',
        400
      );
    }

    const payment = await PaymentAdminService.initiatePayment({
      orderId,
      userId,
      amount,
      paymentMethod,
      provider: provider || 'razorpay',
      status: 'pending',
    });

    sendSuccess(res, payment, 'Payment initiated successfully', 201);
  }),

  /**
   * PROCESS PAYMENT (WEBHOOK/CALLBACK)
   * POST /admin/payments/:transactionId/process
   */
  processPayment: catchAsync(async (req, res) => {
    const { transactionId } = req.params;
    const { providerResponse } = req.body;

    if (!providerResponse) {
      return sendError(res, 'Provider response required', 400);
    }

    const payment = await PaymentAdminService.processPayment(
      transactionId,
      providerResponse
    );

    sendSuccess(res, payment, 'Payment processed successfully', 200);
  }),

  /**
   * INITIATE REFUND
   * POST /admin/payments/:transactionId/refund
   */
  initiateRefund: catchAsync(async (req, res) => {
    const { transactionId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return sendError(res, 'Amount and reason are required', 400);
    }

    const payment = await PaymentAdminService.refundPayment(
      transactionId,
      amount,
      reason
    );

    sendSuccess(res, payment, 'Refund initiated successfully', 200);
  }),

  /**
   * GET PAYMENT
   * GET /admin/payments/:id
   */
  getPayment: catchAsync(async (req, res) => {
    const { id } = req.params;
    const payment = await PaymentAdminService.getPaymentById(id);
    sendSuccess(res, payment, 'Payment retrieved successfully', 200);
  }),

  /**
   * LIST PAYMENTS
   * GET /admin/payments
   */
  listPayments: catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status, userId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const payments = await PaymentAdminService.listPayments(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    sendSuccess(res, payments, 'Payments retrieved successfully', 200);
  }),

  /**
   * GET PAYMENTS BY STATUS
   * GET /admin/payments/status/:status
   */
  getByStatus: catchAsync(async (req, res) => {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const payments = await PaymentAdminService.getPaymentsByStatus(status, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    sendSuccess(res, payments, 'Payments retrieved successfully', 200);
  }),

  /**
   * UPDATE PAYMENT STATUS
   * PATCH /admin/payments/:id/status
   */
  updateStatus: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return sendError(res, 'Status is required', 400);
    }

    const payment = await PaymentAdminService.updatePaymentStatus(id, status);
    sendSuccess(res, payment, 'Payment status updated successfully', 200);
  }),

  /**
   * DELETE PAYMENT
   * DELETE /admin/payments/:id
   */
  deletePayment: catchAsync(async (req, res) => {
    const { id } = req.params;
    const payment = await PaymentAdminService.deletePayment(id);
    sendSuccess(res, payment, 'Payment deleted successfully', 200);
  }),

  /**
   * RAZORPAY WEBHOOK
   * POST /admin/payments/razorpay/webhook
   */
  razorpayWebhook: catchAsync(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return sendError(res, 'Webhook signature missing', 400);
    }

    const event = await PaymentAdminService.handleRazorpayWebhook(
      req.body,
      signature
    );

    // Log webhook event for debugging
    console.log('[Razorpay Webhook]', event);

    sendSuccess(res, event, 'Webhook processed successfully', 200);
  }),

  /**
   * CREATE RAZORPAY REFUND (Admin)
   * POST /admin/payments/razorpay/:paymentId/refund
   */
  createRazorpayRefund: catchAsync(async (req, res) => {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return sendError(res, 'Amount and reason are required', 400);
    }

    const refund = await PaymentAdminService.createRazorpayRefund(
      paymentId,
      amount,
      reason
    );

    sendSuccess(res, refund, 'Razorpay refund initiated successfully', 201);
  }),
};

module.exports = {
  PaymentController,
  PaymentAdminController,
};
