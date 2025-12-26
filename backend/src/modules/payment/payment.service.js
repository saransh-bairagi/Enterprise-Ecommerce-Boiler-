const { PaymentDAO, PaymentAdminDAO } = require('./payment.dao');
const { transactionDTO } = require('./payment.dto');
const AppError = require('../../core/appError');
const RazorpayService = require('./razorpay');
const logger = require('../../config/logger');

// In-memory idempotency store (replace with persistent store in production)
const idempotencyStore = new Map();

/**
 * PAYMENT SERVICE
 * Business logic for payment processing
 */

const PaymentService = {
  async getPaymentStatus(transactionId) {
    const transaction = await PaymentDAO.findByTransactionId(transactionId);
    if (!transaction) {
      throw new AppError('Payment not found', 404);
    }
    return transactionDTO(transaction);
  },

  async getPaymentByOrder(orderId) {
    const transaction = await PaymentDAO.findByOrderId(orderId);
    if (!transaction) {
      throw new AppError('Payment not found for this order', 404);
    }
    return transactionDTO(transaction);
  },

  async getUserPayments(userId, options) {
    const payments = await PaymentDAO.findByUserId(userId, options);
    return {
      ...payments,
      items: payments.items.map(transactionDTO),
    };
  },

  async validatePaymentAmount(amount) {
    if (amount <= 0) {
      throw new AppError('Invalid payment amount', 400);
    }
    return true;
  },

  /**
   * CREATE RAZORPAY ORDER (idempotent)
   */
  async createRazorpayOrder(orderId, amount, customerInfo, idempotencyKey) {
    if (idempotencyKey) {
      if (idempotencyStore.has(idempotencyKey)) {
        logger.info(`[IDEMPOTENCY] Returning cached Razorpay order for key: ${idempotencyKey}`);
        return idempotencyStore.get(idempotencyKey);
      }
    }
    await this.validatePaymentAmount(amount);
    const razorpayOrder = await RazorpayService.createOrder(
      amount,
      orderId,
      customerInfo
    );
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, razorpayOrder);
      logger.info(`[IDEMPOTENCY] Stored Razorpay order for key: ${idempotencyKey}`);
    }
    return razorpayOrder;
  },

  /**
   * VERIFY RAZORPAY PAYMENT
   */
  async verifyRazorpayPayment(paymentId, orderId, signature) {
    RazorpayService.verifyPaymentSignature(paymentId, orderId, signature);
    const paymentDetails = await RazorpayService.getPaymentDetails(paymentId);
    return paymentDetails;
  },
};

// ----------------------------------------------------------
// ADMIN SERVICE
// ----------------------------------------------------------

const PaymentAdminService = {
  async initiatePayment(paymentData) {
    const transaction = await PaymentAdminDAO.create({
      ...paymentData,
      status: 'pending',
    });
    return transactionDTO(transaction);
  },

  async processPayment(transactionId, providerResponse) {
    const transaction = await PaymentAdminDAO.updateById(transactionId, {
      status: 'success',
      providerTransactionId: providerResponse.id,
      gatewayResponse: providerResponse,
    });

    if (!transaction) {
      throw new AppError('Payment processing failed', 500);
    }

    return transactionDTO(transaction);
  },

  async failPayment(transactionId, errorMessage) {
    const transaction = await PaymentAdminDAO.updateById(transactionId, {
      status: 'failed',
      errorMessage,
      $inc: { retryCount: 1 },
    });
    return transactionDTO(transaction);
  },

  async refundPayment(transactionId, amount, reason) {
    const transaction = await PaymentDAO.findById(transactionId);
    if (!transaction) {
      throw new AppError('Payment not found', 404);
    }

    if (transaction.status !== 'success') {
      throw new AppError('Only successful payments can be refunded', 400);
    }

    const refundId = `REF-${Date.now()}`;
    const updated = await PaymentAdminDAO.addRefund(transactionId, {
      refundId,
      amount,
      reason,
      status: 'pending',
      processedAt: new Date(),
    });

    return transactionDTO(updated);
  },
  async updatePaymentStatus(transactionId, status) {
    const transaction = await PaymentAdminDAO.updateStatus(transactionId, status);
    if (!transaction) {
      throw new AppError('Payment not found', 404);
    }
    return transactionDTO(transaction);
  },

  async getPaymentById(id) {
    const transaction = await PaymentDAO.findById(id);
    if (!transaction) {
      throw new AppError('Payment not found', 404);
    }
    return transactionDTO(transaction);
  },

  async listPayments(filter, options) {
    const payments = await PaymentDAO.list(filter, options);
    return {
      ...payments,
      items: payments.items.map(transactionDTO),
    };
  },

  async getPaymentsByStatus(status, options) {
    const payments = await PaymentAdminDAO.getByStatus(status, options);
    return {
      ...payments,
      items: payments.items.map(transactionDTO),
    };
  },

  async deletePayment(id) {
    const transaction = await PaymentAdminDAO.deleteById(id);
    if (!transaction) {
      throw new AppError('Payment not found', 404);
    }
  
    return transactionDTO(transaction);
  },

  /**
   * CREATE RAZORPAY REFUND
   */
  async createRazorpayRefund(paymentId, amount, reason) {
    const refund = await RazorpayService.refundPayment(paymentId, amount, {
      reason,
    });
    return refund;
  },

  /**
   * HANDLE RAZORPAY WEBHOOK
   */
  async handleRazorpayWebhook(body, signature) {
    RazorpayService.verifyWebhookSignature(body, signature);
    const event = RazorpayService.handleWebhookEvent(
      body.event,
      body.payload
    );
    return event;
  },

};

module.exports = {
  PaymentService,
  PaymentAdminService,
};

// ----------------------
// PAYMENT LIFECYCLE COMMENTS
//
// 1. CheckoutService validates cart
// 2. PricingService calculates final price
// 3. CouponService applies discount
// 4. PaymentService creates payment order (idempotent)
// 5. OrderService locks inventory
// 6. PaymentService verifies payment and updates transaction/order
// 7. Refunds handled only via PaymentService
// 8. Reconciliation job ensures consistency
