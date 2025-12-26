const CheckoutService = require('./checkout.service');
const catchAsync = require('../../core/catchAsync');
const { sendSuccess } = require('../../core/response');
const AppError = require('../../core/appError');

const CheckoutController = {
  // Get checkout summary
  getSummary: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const summary = await CheckoutService.getCheckoutSummary(userId);
    sendSuccess(res, summary);
  }),

  // Validate checkout
  validate: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const validation = await CheckoutService.validateCheckout(userId, req.body);
    sendSuccess(res, validation);
  }),

  // Process checkout
    process: catchAsync(async (req, res) => {
      const userId = req.attachedSECRET?.userId;
      if (!userId) throw new AppError('Unauthorized', 401);

      const CheckoutTransactionService = require('./checkout.transaction.service');
      const idempotencyKey = req.headers['idempotency-key'];
      const order = await CheckoutService.processCheckout({
        userId,
        payload: req.body,
        idempotencyKey
      });
      sendSuccess(res, order, 'Order created successfully', 201);
    }),

  // Apply coupon at checkout
  applyCoupon: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { couponCode } = req.body;
    if (!couponCode) throw new AppError('Coupon code required', 400);

    const result = await CheckoutService.applyCouponAtCheckout(userId, couponCode);
    sendSuccess(res, result);
  }),

  // Validate payment
  validatePayment: catchAsync(async (req, res) => {
    const validation = await CheckoutService.validatePayment(req.body);
    sendSuccess(res, validation);
  }),
};

module.exports = CheckoutController;
