const crypto = require('crypto');
const Razorpay = require('razorpay');
const AppError = require('../../core/appError');

/**
 * RAZORPAY PAYMENT GATEWAY INTEGRATION
 * Handles all Razorpay payment processing
 */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const RazorpayService = {
  /**
   * CREATE RAZORPAY ORDER
   */
  async createOrder(amount, orderId, customerInfo = {}) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency: 'INR',
        receipt: `rcpt_${orderId}`,
        payment_capture: 1, // Auto capture payment
        customer_notify: 1,
        notes: {
          orderId,
          customerId: customerInfo.userId,
          email: customerInfo.email,
        },
      };

      const order = await razorpay.orders.create(options);

      return {
        id: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        status: order.status,
        orderId,
      };
    } catch (error) {
      throw new AppError(
        `Razorpay order creation failed: ${error.message}`,
        500
      );
    }
  },

  /**
   * FETCH PAYMENT DETAILS
   */
  async getPaymentDetails(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return {
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        acquirerData: payment.acquirer_data,
        vpa: payment.vpa,
        createdAt: new Date(payment.created_at * 1000),
      };
    } catch (error) {
      throw new AppError(
        `Failed to fetch payment details: ${error.message}`,
        500
      );
    }
  },

  /**
   * VERIFY PAYMENT SIGNATURE
   */
  verifyPaymentSignature(paymentId, orderId, signature) {
    try {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      const isValid = expectedSignature === signature;
      if (!isValid) {
        throw new AppError('Invalid payment signature', 400);
      }

      return isValid;
    } catch (error) {
      throw new AppError(`Signature verification failed: ${error.message}`, 400);
    }
  },

  /**
   * CAPTURE PAYMENT
   */
  async capturePayment(paymentId, amount) {
    try {
      const payment = await razorpay.payments.capture(
        paymentId,
        Math.round(amount * 100)
      );

      return {
        id: payment.id,
        status: payment.status,
        amount: payment.amount / 100,
      };
    } catch (error) {
      throw new AppError(`Payment capture failed: ${error.message}`, 500);
    }
  },

  /**
   * REFUND PAYMENT
   */
  async refundPayment(paymentId, amount, notes = {}) {
    try {
      const refundOptions = {
        amount: amount ? Math.round(amount * 100) : undefined,
        notes,
      };

      const refund = await razorpay.payments.refund(paymentId, refundOptions);

      return {
        id: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100,
        status: refund.status,
        createdAt: new Date(refund.created_at * 1000),
      };
    } catch (error) {
      throw new AppError(`Refund failed: ${error.message}`, 500);
    }
  },

  /**
   * GET REFUND STATUS
   */
  async getRefundStatus(refundId) {
    try {
      const refund = await razorpay.refunds.fetch(refundId);

      return {
        id: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100,
        status: refund.status,
        createdAt: new Date(refund.created_at * 1000),
      };
    } catch (error) {
      throw new AppError(`Failed to fetch refund status: ${error.message}`, 500);
    }
  },

  /**
   * CREATE WEBHOOK SIGNATURE
   */
  verifyWebhookSignature(body, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');

      const isValid = expectedSignature === signature;
      if (!isValid) {
        throw new AppError('Invalid webhook signature', 400);
      }

      return isValid;
    } catch (error) {
      throw new AppError(
        `Webhook signature verification failed: ${error.message}`,
        400
      );
    }
  },

  /**
   * HANDLE WEBHOOK EVENTS
   */
  handleWebhookEvent(event, eventData) {
    switch (event) {
      case 'payment.authorized':
        return { event, status: 'authorized', data: eventData.payment };

      case 'payment.failed':
        return { event, status: 'failed', data: eventData.payment };

      case 'payment.captured':
        return { event, status: 'success', data: eventData.payment };

      case 'refund.created':
        return { event, status: 'refund_initiated', data: eventData.refund };

      case 'refund.failed':
        return { event, status: 'refund_failed', data: eventData.refund };

      case 'refund.processed':
        return { event, status: 'refund_success', data: eventData.refund };

      default:
        return { event, status: 'unknown', data: eventData };
    }
  },

  /**
   * CREATE SUBSCRIPTION (For recurring payments)
   */
  async createSubscription(planId, customerId, totalCount = 12) {
    try {
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        quantity: 1,
        total_count: totalCount,
        start_at: Math.floor(Date.now() / 1000),
      });

      return {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.plan_id,
        customerId: subscription.customer_id,
      };
    } catch (error) {
      throw new AppError(`Subscription creation failed: ${error.message}`, 500);
    }
  },

  /**
   * VALIDATE INTERNATIONAL CARD
   */
  async validateCard(cardDetails) {
    try {
      // Razorpay doesn't require pre-validation
      // Cards are validated during payment
      const { number, expiry, cvv } = cardDetails;

      // Basic client-side validation
      if (!number || number.length < 13) {
        throw new AppError('Invalid card number', 400);
      }

      if (!expiry || !expiry.match(/^\d{2}\/\d{2}$/)) {
        throw new AppError('Invalid expiry format (MM/YY)', 400);
      }

      if (!cvv || cvv.length < 3) {
        throw new AppError('Invalid CVV', 400);
      }

      return { valid: true };
    } catch (error) {
      throw new AppError(`Card validation failed: ${error.message}`, 400);
    }
  },
};

module.exports = RazorpayService;
