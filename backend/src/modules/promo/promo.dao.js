/**
 * Promo DAO
 */

const Promo = require('./promo.model');
const mongoose = require('mongoose');

const PromoDAO = {
  async findById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Promo.findOne({ _id: id, isDeleted: false })
      .populate(['targetProducts', 'targetCategories'])
      .lean()
      .exec();
  },

  async findByPublicId(publicId) {
    return Promo.findOne({ publicId, isDeleted: false })
      .populate(['targetProducts', 'targetCategories'])
      .lean()
      .exec();
  },

  async findActive(query = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const now = new Date();

    const [items, total] = await Promise.all([
      Promo.find({
        isActive: true,
        isDeleted: false,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
        .sort({ position: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Promo.countDocuments({
        isActive: true,
        isDeleted: false,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async list(filter = {}, { page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Promo.find({ ...filter, isDeleted: false })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Promo.countDocuments({ ...filter, isDeleted: false }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },
};

const PromoAdminDAO = {
  async create(data) {
    const promo = new Promo(data);
    return promo.save();
  },

  async updateById(id, data) {
    return Promo.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  },

  async updateByPublicId(publicId, data) {
    const promoDoc = await PromoDAO.findByPublicId(publicId);
    if (!promoDoc) return null;

    return Promo.findByIdAndUpdate(
      promoDoc._id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  },

  async incrementClick(id) {
    return Promo.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } },
      { new: true }
    ).exec();
  },

  async incrementImpression(id) {
    return Promo.findByIdAndUpdate(
      id,
      { $inc: { impressions: 1 } },
      { new: true }
    ).exec();
  },

  async softDelete(id) {
    return Promo.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, isActive: false } },
      { new: true }
    ).exec();
  },

  async restore(id) {
    return Promo.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false } },
      { new: true }
    ).exec();
  },

  async hardDelete(id) {
    return Promo.findByIdAndDelete(id).exec();
  },
};

module.exports = { PromoDAO, PromoAdminDAO };
