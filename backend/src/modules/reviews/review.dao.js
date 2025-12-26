/**
 * Review DAO
 */

const Review = require('./review.model');
const mongoose = require('mongoose');

const ReviewDAO = {
  async findById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Review.findOne({ _id: id, isDeleted: false })
      .populate(['productId', 'userId'])
      .lean()
      .exec();
  },

  async findByProductId(productId, query = {}) {
    const { page = 1, limit = 20, status = 'approved' } = query;
    const skip = (page - 1) * limit;

    const filter = { productId, isDeleted: false };
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      Review.find(filter)
        .populate('userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Review.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async findByUserId(userId) {
    return Review.find({ userId, isDeleted: false })
      .populate('productId')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  async list(filter = {}, { page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Review.find({ ...filter, isDeleted: false })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Review.countDocuments({ ...filter, isDeleted: false }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async getAverageRating(productId) {
    const result = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved', isDeleted: false } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    return result[0] || { avgRating: 0, count: 0 };
  },
};

const ReviewAdminDAO = {
  async create(data) {
    const review = new Review(data);
    return review.save();
  },

  async updateById(id, data) {
    return Review.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  },

  async approveReview(id, approvedBy) {
    return Review.findByIdAndUpdate(
      id,
      { $set: { status: 'approved', approvedBy, approvedAt: new Date() } },
      { new: true }
    ).exec();
  },

  async rejectReview(id, rejectionReason, approvedBy) {
    return Review.findByIdAndUpdate(
      id,
      { $set: { status: 'rejected', rejectionReason, approvedBy } },
      { new: true }
    ).exec();
  },

  async markHelpful(id) {
    return Review.findByIdAndUpdate(
      id,
      { $inc: { helpful: 1 } },
      { new: true }
    ).exec();
  },

  async markUnhelpful(id) {
    return Review.findByIdAndUpdate(
      id,
      { $inc: { unhelpful: 1 } },
      { new: true }
    ).exec();
  },

  async softDelete(id) {
    return Review.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true }
    ).exec();
  },

  async restore(id) {
    return Review.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false } },
      { new: true }
    ).exec();
  },

  async hardDelete(id) {
    return Review.findByIdAndDelete(id).exec();
  },
};

module.exports = { ReviewDAO, ReviewAdminDAO };
