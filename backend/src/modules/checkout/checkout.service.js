/**
 * Checkout Service
 * Handles the checkout flow - validates cart, processes payment, creates order
*/

const AppError = require('../../core/appError');
const CartService = require('../cart/cart.service');
const {OrderService,OrderAdminService} = require('../order/order.service');
const orderDTO = require('../order/order.dto').orderDTO;
const ERROR = require('../../core/constants').ERRORS;
const AddressService = require('../address/address.service');
const {CouponService} = require('../coupons/coupon.service');

const mongoose = require('mongoose');
const IdempotencyService = require('../../common/idempotency/idempotency.service');
const {PaymentService} = require('../payment/payment.service');
const {PricingService} = require('../pricing/pricing.service');
const {StockAdminService} = require('../inventory/stock/stock.service');
const CheckoutService = {
  // Validate cart and prepare checkout
  validateCheckout: async (userId, checkoutData) => {
    // Get user's cart via CartService
    const cart = await CartService.getCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Validate checkout data
    const { shippingAddress, billingAddress, paymentMethod } = checkoutData;
    if (!shippingAddress) {
      throw new AppError('Shipping address is required', 400);
    }
    if (!paymentMethod) {
      throw new AppError('Payment method is required', 400);
    }

    return {
      cartValid: true,
      itemsCount: cart.items.length,
      total: cart.total,
      tax: cart.tax,
    };
  },
    
  processCheckout: async (userId, checkoutData) => {
    // Enterprise transaction boundary with idempotency

    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentDetails = {},
      couponCode,
      idempotencyKey,
    } = checkoutData;

    // 1️⃣ Idempotency guard
    if (idempotencyKey) {
      const existing = await IdempotencyService.get(idempotencyKey);
      if (existing) return existing.response;
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 2️⃣ Validate cart
      const cart = await CartService.getCartByUserId(userId);
      if (!cart || cart.items.length === 0) {
        throw new AppError('Cart is empty', 400);
      }
      if (!shippingAddress) {
        throw new AppError('Shipping address is required', 400);
      }
      if (!paymentMethod) {
        throw new AppError('Payment method is required', 400);
      }

      // 3️⃣ Calculate pricing and apply coupon
      let total = cart.subtotal;
      let discount = 0;
      let couponDiscount = 0;
      if (couponCode) {
        const coupon = await CouponService.validateCoupon(couponCode, cart.subtotal);
        couponDiscount = coupon.discount || 0;
        total -= couponDiscount;
      }
      for (const item of cart.items) {
        const priceResult = await PricingService.calculatePrice(item.productId, item.quantity, item.price);
        discount += priceResult.discount;
        item.price = priceResult.finalPrice;
        item.discount = priceResult.discount;
        item.total = priceResult.finalPrice * iutem.quantity;
      }
      total -= discount;
      if (total < 0) total = 0;

      // 4️⃣ Create shipping and billing address records
      const shippingAddressId = await AddressService.createAddress(userId, shippingAddress);
      let billingAddressId = shippingAddressId;
      if (billingAddress) {
        billingAddressId = await AddressService.createAddress(userId, billingAddress);
      }

      // 5️⃣ Create order (PENDING)
      const orderData = {
        userId,
        items: cart.items,
        shippingAddress: shippingAddressId._id || shippingAddressId,
        billingAddress: billingAddressId._id || billingAddressId,
        subtotal: cart.subtotal,
        discount,
        tax: cart.tax,
        couponCode: couponCode || null,
        couponDiscount,
        total,
        payment: {
          method: paymentMethod,
          transactionId: null,
          status: 'pending',
          amount: total,
        },
        status: 'pending',
      };
      const order = await OrderAdminService.createOrder(orderData, session);

      // 5️⃣ Capture payment
      const payment = await PaymentService.capture(order, paymentDetails, session);

      // 6️⃣ Mark order PAID
      await OrderAdminService.markPaid(order.id, payment.id, session);

      // 7️⃣ Decrement inventory
      await StockAdminService.decrementStock(order.items, session);

      await session.commitTransaction();
      session.endSession();

      // 8️⃣ Persist idempotency result
      if (idempotencyKey) {
        await IdempotencyService.save(idempotencyKey, order);
      }

      return order;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      // 9️⃣ Compensation
      await PaymentService.refundIfNeeded(paymentDetails);

      throw err;
    }
  },

  // Get checkout summary
  getCheckoutSummary: async (userId) => {
    const cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    return {
      itemsCount: cart.items.length,
      items: cart.items,
      subtotal: cart.subtotal,
      discount: cart.discount,
      tax: cart.tax,
      couponCode: cart.couponCode,
      couponDiscount: cart.couponDiscount,
      total: cart.total,
    };
  },

  // Apply coupon during checkout
  applyCouponAtCheckout: async (userId, couponCode) => {
    // Use CartService and CouponService only
    const cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const CouponService = require('../coupons/coupon.service');
    const coupon = await CouponService.validateCoupon(couponCode, cart.subtotal);
    cart.couponCode = couponCode;
    cart.couponDiscount = coupon.discount || 0;
    cart.total = cart.subtotal - cart.couponDiscount;
    if (cart.total < 0) cart.total = 0;

    await CartService.updateCartTotals(userId, cart);

    return {
      couponCode,
      couponDiscount: cart.couponDiscount,
      total: cart.total,
    };
  },

  // Validate payment
  validatePayment: async (paymentData) => {
    const { method, amount, transactionId } = paymentData;

    if (!method) throw new AppError('Payment method required', 400);
    if (!amount || amount <= 0) throw new AppError('Invalid amount', 400);

    const validMethods = ['credit_card', 'debit_card', 'upi', 'wallet', 'cod'];
    if (!validMethods.includes(method)) {
      throw new AppError('Invalid payment method', 400);
    }

    return {
      valid: true,
      method,
      amount,
      transactionId,
    };
  },
};

module.exports = CheckoutService;
