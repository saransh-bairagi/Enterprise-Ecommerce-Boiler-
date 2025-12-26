/**
 * Review Service
 */

const { ReviewDAO, ReviewAdminDAO } = require('./review.dao');
const { reviewDTO } = require('./review.dto');
const AppError = require('../../core/appError');

const ReviewService = {
  // Get reviews for a product
  getProductReviews: async (productId, query = {}) => {
    const res = await ReviewDAO.findByProductId(productId, {
      ...query,
      status: 'approved',
    });
    res.items = res.items.map(reviewDTO);
    return res;
  },

  // Get user's reviews
  getUserReviews: async (userId) => {
    const reviews = await ReviewDAO.findByUserId(userId);
    return reviews.map(reviewDTO);
  },

  // Get average rating for product
  getProductRating: async (productId) => {
    return ReviewDAO.getAverageRating(productId);
  },

  // Mark review as helpful
  markHelpful: async (id) => {
    const updated = await ReviewAdminDAO.markHelpful(id);
    if (!updated) throw new AppError('Review not found', 404);
    return reviewDTO(updated);
  },

  // Mark review as unhelpful
  markUnhelpful: async (id) => {
    const updated = await ReviewAdminDAO.markUnhelpful(id);
    if (!updated) throw new AppError('Review not found', 404);
    return reviewDTO(updated);
  },

  // List reviews
  listReviews: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await ReviewDAO.list(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(reviewDTO);
    return res;
  },
};

const ReviewAdminService = {
  createReview: async (data) => {
    const created = await ReviewAdminDAO.create(data);
    return reviewDTO(created);
  },

  approveReview: async (id, userId) => {
    const approved = await ReviewAdminDAO.approveReview(id, userId);
    if (!approved) throw new AppError('Review not found', 404);
    return reviewDTO(approved);
  },

  rejectReview: async (id, rejectionReason, userId) => {
    const rejected = await ReviewAdminDAO.rejectReview(id, rejectionReason, userId);
    if (!rejected) throw new AppError('Review not found', 404);
    return reviewDTO(rejected);
  },

  deleteReview: async (id) => {
    const deleted = await ReviewAdminDAO.softDelete(id);
    if (!deleted) throw new AppError('Review not found', 404);
    return reviewDTO(deleted);
  },

  restoreReview: async (id) => {
    const restored = await ReviewAdminDAO.restore(id);
    if (!restored) throw new AppError('Review not found', 404);
    return reviewDTO(restored);
  },

  listReviews: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await ReviewDAO.list(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(reviewDTO);
    return res;
  },

  getPendingReviews: async (query = {}) => {
    const { page = 1, limit = 20 } = query;
    const res = await ReviewDAO.list({ status: 'pending' }, {
      page,
      limit,
      sort: { createdAt: 1 },
    });
    res.items = res.items.map(reviewDTO);
    return res;
  },
};

module.exports = { ReviewService, ReviewAdminService };
