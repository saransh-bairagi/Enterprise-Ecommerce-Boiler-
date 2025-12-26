/**
 * Coupon Service
 */

const { CouponDAO, CouponAdminDAO } = require('./coupon.dao');
const { couponDTO } = require('./coupon.dto');
const AppError = require('../../core/appError');

const CouponService = {
  // Validate and get coupon
  validateCoupon: async (code, orderAmount) => {
    const coupon = await CouponDAO.findByCode(code);
    if (!coupon) throw new AppError('Coupon not found', 404);
    if (!coupon.isValid()) throw new AppError('Coupon expired or inactive', 400);
    if (orderAmount < coupon.minOrderValue) {
      throw new AppError(
        `Minimum order value of ${coupon.minOrderValue} required`,
        400
      );
    }

    return couponDTO(coupon);
  },

  // Get coupon details
  getCoupon: async (code) => {
    const coupon = await CouponDAO.findByCode(code);
    if (!coupon) throw new AppError('Coupon not found', 404);
    return couponDTO(coupon);
  },

  // Calculate discount
  calculateDiscount: async (code, orderAmount) => {
    const coupon = await CouponDAO.findByCode(code);
    if (!coupon) throw new AppError('Coupon not found', 404);
    if (!coupon.isValid()) throw new AppError('Coupon expired or inactive', 400);

    const discount = coupon.calculateDiscount(orderAmount);
    return {
      code,
      discountType: coupon.discountType,
      discount,
      finalAmount: orderAmount - discount,
    };
  },

  // List active coupons
  listActive: async (query = {}) => {
    const res = await CouponDAO.listActive(query);
    res.items = res.items.map(couponDTO);
    return res;
  },
};

const CouponAdminService = {
  createCoupon: async (data) => {
    const existing = await CouponDAO.findByCode(data.code);
    if (existing) throw new AppError('Coupon code already exists', 409);

    const created = await CouponAdminDAO.create(data);
    return couponDTO(created);
  },

  updateCoupon: async (publicId, update, userId) => {
    const couponDoc = await CouponDAO.findByPublicId(publicId);
    if (!couponDoc) throw new AppError('Coupon not found', 404);

    const updated = await CouponAdminDAO.updateById(
      couponDoc._id,
      { ...update, updatedBy: userId }
    );
    return couponDTO(updated);
  },

  deleteCoupon: async (publicId) => {
    const couponDoc = await CouponDAO.findByPublicId(publicId);
    if (!couponDoc) throw new AppError('Coupon not found', 404);

    const deleted = await CouponAdminDAO.softDelete(couponDoc._id);
    return couponDTO(deleted);
  },

  restoreCoupon: async (publicId) => {
    const couponDoc = await CouponDAO.findByPublicId(publicId);
    if (!couponDoc) throw new AppError('Coupon not found', 404);

    const restored = await CouponAdminDAO.restore(couponDoc._id);
    return couponDTO(restored);
  },

  listCoupons: async (query = {}) => {
    const res = await CouponDAO.list(query.filters || {}, {
      page: query.page || 1,
      limit: query.limit || 20,
    });
    res.items = res.items.map(couponDTO);
    return res;
  },
};

module.exports = { CouponService, CouponAdminService };
