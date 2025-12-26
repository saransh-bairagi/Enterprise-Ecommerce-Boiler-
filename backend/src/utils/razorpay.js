/**
 * RAZORPAY INTEGRATION SERVICE
 * Handles all Razorpay payment gateway operations
 */

const crypto = require('crypto');
const Razorpay = require('razorpay');
const AppError = require('../core/appError');
const {RAZORPAY_KEY_ID,RAZORPAY_KEY_SECRET}=require('../config/env')
class RazorpayService {
  constructor() {
    this.razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * CREATE RAZORPAY ORDER
   * @param {number} amount - Amount in rupees (will be converted to paise)
   * @param {string} orderId - Order ID reference
   * @param {object} customerInfo - {userId, email}
   * @returns {object} Razorpay order details
   */
  async createOrder(amount, orderId, customerInfo = {}) {
    try {
      const razorpayOrder = await this.razorpayInstance.orders.create({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `order_${orderId}`,
        notes: {
          orderId,
          userId: customerInfo.userId,
        },
      });

      return {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        amountPaid: razorpayOrder.amount_paid,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status,
        receipt: razorpayOrder.receipt,
        createdAt: new Date(razorpayOrder.created_at * 1000),
      };
    } catch (error) {
      throw new AppError(
        `Razorpay order creation failed: ${error.message}`,
        500
      );
    }
  }

  /**
   * GET PAYMENT DETAILS
   * @param {string} paymentId - Razorpay payment ID
   * @returns {object} Payment details
   */
  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpayInstance.payments.fetch(paymentId);

      return {
        id: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        amountRefunded: payment.amount_refunded,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        vpa: payment.vpa,
        acquirerData: payment.acquirer_data,
        fee: payment.fee,
        tax: payment.tax,
        notes: payment.notes,
        description: payment.description,
      };
    } catch (error) {
      throw new AppError(
        `Failed to fetch payment details: ${error.message}`,
        500
      );
    }
  }

  /**
   * VERIFY PAYMENT SIGNATURE
   * Validates HMAC-SHA256 signature for payment verification
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} orderId - Razorpay order ID
   * @param {string} signature - Payment signature from frontend
   * @returns {boolean} True if signature is valid
   */
  verifyPaymentSignature(paymentId, orderId, signature) {
    try {
      // Body format: orderId|paymentId
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new AppError('Invalid payment signature', 400);
      }

      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Signature verification failed: ${error.message}`, 400);
    }
  }

  /**
   * CAPTURE PAYMENT
   * Captures a previously authorized payment
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount in rupees
   * @returns {object} Captured payment details
   */
  async capturePayment(paymentId, amount) {
    try {
      const capturedPayment = await this.razorpayInstance.payments.capture(
        paymentId,
        amount * 100 // Convert to paise
      );

      return {
        id: capturedPayment.id,
        status: capturedPayment.status,
        amount: capturedPayment.amount,
        method: capturedPayment.method,
        email: capturedPayment.email,
      };
    } catch (error) {
      throw new AppError(`Payment capture failed: ${error.message}`, 500);
    }
  }

  /**
   * REFUND PAYMENT
   * Initiates a refund for a payment
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Refund amount in rupees (optional - full refund if not provided)
   * @param {object} notes - Refund notes {reason, etc}
   * @returns {object} Refund details
   */
  async refundPayment(paymentId, amount = null, notes = {}) {
    try {
      const refundParams = {
        notes,
      };

      // If amount is provided, it's a partial refund
      if (amount) {
        refundParams.amount = amount * 100; // Convert to paise
      }

      const refund = await this.razorpayInstance.payments.refund(
        paymentId,
        refundParams
      );

      return {
        id: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount,
        amountRefunded: refund.amount_refunded,
        currency: refund.currency,
        status: refund.status,
        notes: refund.notes,
        createdAt: new Date(refund.created_at * 1000),
      };
    } catch (error) {
      throw new AppError(`Refund initiation failed: ${error.message}`, 500);
    }
  }

  /**
   * GET REFUND STATUS
   * @param {string} refundId - Razorpay refund ID
   * @returns {object} Refund status details
   */
  async getRefundStatus(refundId) {
    try {
      const refund = await this.razorpayInstance.refunds.fetch(refundId);

      return {
        id: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        notes: refund.notes,
      };
    } catch (error) {
      throw new AppError(`Failed to fetch refund status: ${error.message}`, 500);
    }
  }

  /**
   * VERIFY WEBHOOK SIGNATURE
   * Validates webhook signature from Razorpay
   * @param {object} body - Webhook request body (raw JSON)
   * @param {string} signature - X-Razorpay-Signature header
   * @returns {boolean} True if signature is valid
   */
  verifyWebhookSignature(body, signature) {
    try {
      const bodyString =
        typeof body === 'string' ? body : JSON.stringify(body);
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(bodyString)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new AppError('Invalid webhook signature', 400);
      }

      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Webhook signature verification failed: ${error.message}`, 400);
    }
  }

  /**
   * HANDLE WEBHOOK EVENT
   * Routes webhook events to appropriate handlers
   * @param {string} event - Webhook event name
   * @param {object} eventData - Event payload
   * @returns {object} Event processing result
   */
  handleWebhookEvent(event, eventData) {
    try {
      const handlers = {
        'payment.authorized': this._handlePaymentAuthorized.bind(this),
        'payment.failed': this._handlePaymentFailed.bind(this),
        'payment.captured': this._handlePaymentCaptured.bind(this),
        'refund.created': this._handleRefundCreated.bind(this),
        'refund.failed': this._handleRefundFailed.bind(this),
        'refund.processed': this._handleRefundProcessed.bind(this),
      };

      if (!handlers[event]) {
        console.warn(`[Razorpay] Unhandled webhook event: ${event}`);
        return {
          event,
          status: 'unknown',
          data: eventData,
        };
      }

      const result = handlers[event](eventData);

      return {
        event,
        status: 'processed',
        data: result,
      };
    } catch (error) {
      throw new AppError(
        `Webhook event handling failed: ${error.message}`,
        500
      );
    }
  }

  /**
   * PAYMENT AUTHORIZED HANDLER
   * @private
   */
  _handlePaymentAuthorized(payload) {
    return {
      paymentId: payload.payment.id,
      orderId: payload.payment.order_id,
      amount: payload.payment.amount,
      status: 'authorized',
      timestamp: new Date(),
    };
  }

  /**
   * PAYMENT FAILED HANDLER
   * @private
   */
  _handlePaymentFailed(payload) {
    return {
      paymentId: payload.payment.id,
      orderId: payload.payment.order_id,
      amount: payload.payment.amount,
      status: 'failed',
      error: payload.payment.error_code,
      reason: payload.payment.error_description,
      timestamp: new Date(),
    };
  }

  /**
   * PAYMENT CAPTURED HANDLER
   * @private
   */
  _handlePaymentCaptured(payload) {
    return {
      paymentId: payload.payment.id,
      orderId: payload.payment.order_id,
      amount: payload.payment.amount,
      status: 'captured',
      fee: payload.payment.fee,
      tax: payload.payment.tax,
      timestamp: new Date(),
    };
  }

  /**
   * REFUND CREATED HANDLER
   * @private
   */
  _handleRefundCreated(payload) {
    return {
      refundId: payload.refund.id,
      paymentId: payload.refund.payment_id,
      amount: payload.refund.amount,
      status: 'created',
      timestamp: new Date(),
    };
  }

  /**
   * REFUND FAILED HANDLER
   * @private
   */
  _handleRefundFailed(payload) {
    return {
      refundId: payload.refund.id,
      paymentId: payload.refund.payment_id,
      amount: payload.refund.amount,
      status: 'failed',
      reason: payload.refund.reason_code,
      timestamp: new Date(),
    };
  }

  /**
   * REFUND PROCESSED HANDLER
   * @private
   */
  _handleRefundProcessed(payload) {
    return {
      refundId: payload.refund.id,
      paymentId: payload.refund.payment_id,
      amount: payload.refund.amount,
      status: 'processed',
      timestamp: new Date(),
    };
  }

  /**
   * CREATE SUBSCRIPTION (RECURRING PAYMENT)
   * @param {string} planId - Razorpay plan ID
   * @param {string} customerId - Razorpay customer ID
   * @param {number} totalCount - Number of payments in subscription
   * @returns {object} Subscription details
   */
  async createSubscription(planId, customerId, totalCount) {
    try {
      const subscription = await this.razorpayInstance.subscriptions.create({
        planId,
        customerId,
        totalCount,
        quantity: 1,
      });

      return {
        id: subscription.id,
        planId: subscription.plan_id,
        customerId: subscription.customer_id,
        status: subscription.status,
        totalCount: subscription.total_count,
        createdAt: new Date(subscription.created_at * 1000),
      };
    } catch (error) {
      throw new AppError(`Subscription creation failed: ${error.message}`, 500);
    }
  }

  /**
   * VALIDATE CARD
   * Basic card validation (format check)
   * @param {object} cardDetails - {number, expiry, cvv}
   * @returns {object} {valid: true} or throws error
   */
  validateCard(cardDetails) {
    try {
      const { number, expiry, cvv } = cardDetails;

      // Basic validation
      if (!number || !/^\d{13,19}$/.test(number.replace(/\s/g, ''))) {
        throw new AppError('Invalid card number', 400);
      }

      if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        throw new AppError('Invalid card expiry (MM/YY)', 400);
      }

      if (!cvv || !/^\d{3,4}$/.test(cvv)) {
        throw new AppError('Invalid CVV', 400);
      }

      return { valid: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Card validation failed: ${error.message}`, 400);
    }
  }
}

module.exports = new RazorpayService();
