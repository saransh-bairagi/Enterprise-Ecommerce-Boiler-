/**
 * Coupon DAO: All database operations.
 */

const Coupon = require('./coupon.model');
const mongoose = require('mongoose');

const CouponDAO = {
  // Find by code
  async findByCode(code) {
    return Coupon.findOne({ code: code.toUpperCase(), isDeleted: false })
      .lean()
      .exec();
  },

  // Find by ID
  async findById(id, opts = {}) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Coupon.findOne({ _id: id, isDeleted: false })
      .populate(opts.populate || [])
      .lean()
      .exec();
  },

  // Find by publicId
  async findByPublicId(publicId) {
    return Coupon.findOne({ publicId, isDeleted: false })
      .lean()
      .exec();
  },

  // List active coupons
  async listActive(query = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const now = new Date();

    const [items, total] = await Promise.all([
      Coupon.find({
        isActive: true,
        isDeleted: false,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Coupon.countDocuments({
        isActive: true,
        isDeleted: false,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  // List all coupons
  async list(filter = {}, { page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Coupon.find({ ...filter, isDeleted: false })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Coupon.countDocuments({ ...filter, isDeleted: false }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },
};

const CouponAdminDAO = {
  async create(data) {
    const coupon = new Coupon(data);
    return coupon.save();
  },

  async updateById(id, data, opts = {}) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Coupon.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true, ...opts }
    ).exec();
  },

  async updateByPublicId(publicId, data, opts = {}) {
    const couponDoc = await CouponDAO.findByPublicId(publicId);
    if (!couponDoc) return null;

    return Coupon.findByIdAndUpdate(
      couponDoc._id,
      { $set: data },
      { new: true, runValidators: true, ...opts }
    ).exec();
  },

  async incrementUsage(couponId) {
    return Coupon.findByIdAndUpdate(
      couponId,
      { $inc: { usageCount: 1 } },
      { new: true }
    ).exec();
  },

  async softDelete(id) {
    return Coupon.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, isActive: false } },
      { new: true }
    ).exec();
  },

  async restore(id) {
    return Coupon.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false } },
      { new: true }
    ).exec();
  },

  async hardDelete(id) {
    return Coupon.findByIdAndDelete(id).exec();
  },
};

module.exports = { CouponDAO, CouponAdminDAO };
