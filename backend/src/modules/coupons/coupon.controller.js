const { CouponService, CouponAdminService } = require('./coupon.service');
const catchAsync = require('../../core/catchAsync');
const { sendSuccess } = require('../../core/response');
const AppError = require('../../core/appError');

const CouponController = {
  // Validate coupon
  validate: catchAsync(async (req, res) => {
    const { code, orderAmount } = req.body;
    if (!code || !orderAmount) {
      throw new AppError('Code and orderAmount required', 400);
    }

    const coupon = await CouponService.validateCoupon(code, orderAmount);
    sendSuccess(res, coupon);
  }),

  // Get coupon details
  get: catchAsync(async (req, res) => {
    const coupon = await CouponService.getCoupon(req.params.code);
    sendSuccess(res, coupon);
  }),

  // Calculate discount
  calculateDiscount: catchAsync(async (req, res) => {
    const { code, orderAmount } = req.body;
    if (!code || !orderAmount) {
      throw new AppError('Code and orderAmount required', 400);
    }

    const result = await CouponService.calculateDiscount(code, orderAmount);
    sendSuccess(res, result);
  }),

  // List active coupons
  listActive: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
    };
    const data = await CouponService.listActive(q);
    sendSuccess(res, data);
  }),
};

const CouponAdminController = {
  create: catchAsync(async (req, res) => {
    const payload = { ...req.body, createdBy: req.attachedSECRET?.userId };
    const created = await CouponAdminService.createCoupon(payload);
    sendSuccess(res, created, 'Coupon created', 201);
  }),

  update: catchAsync(async (req, res) => {
    const updated = await CouponAdminService.updateCoupon(
      req.params.publicId,
      req.body,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, updated, 'Coupon updated');
  }),

  delete: catchAsync(async (req, res) => {
    const deleted = await CouponAdminService.deleteCoupon(req.params.publicId);
    sendSuccess(res, deleted, 'Coupon deleted');
  }),

  restore: catchAsync(async (req, res) => {
    const restored = await CouponAdminService.restoreCoupon(req.params.publicId);
    sendSuccess(res, restored, 'Coupon restored');
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await CouponAdminService.listCoupons(q);
    sendSuccess(res, data);
  }),
};

module.exports = { CouponController, CouponAdminController };
