const { ReviewService, ReviewAdminService } = require('./review.service');
const catchAsync = require('../../core/catchAsync');
const { sendSuccess } = require('../../core/response');
const AppError = require('../../core/appError');

const ReviewController = {
  getProductReviews: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
    };
    const reviews = await ReviewService.getProductReviews(req.params.productId, q);
    sendSuccess(res, reviews);
  }),

  getProductRating: catchAsync(async (req, res) => {
    const rating = await ReviewService.getProductRating(req.params.productId);
    sendSuccess(res, rating);
  }),

  getUserReviews: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const reviews = await ReviewService.getUserReviews(userId);
    sendSuccess(res, reviews);
  }),

  markHelpful: catchAsync(async (req, res) => {
    const updated = await ReviewService.markHelpful(req.params.id);
    sendSuccess(res, updated);
  }),

  markUnhelpful: catchAsync(async (req, res) => {
    const updated = await ReviewService.markUnhelpful(req.params.id);
    sendSuccess(res, updated);
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await ReviewService.listReviews(q);
    sendSuccess(res, data);
  }),
};

const ReviewAdminController = {
  create: catchAsync(async (req, res) => {
    const created = await ReviewAdminService.createReview(req.body);
    sendSuccess(res, created, 'Review created', 201);
  }),

  approve: catchAsync(async (req, res) => {
    const approved = await ReviewAdminService.approveReview(
      req.params.id,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, approved, 'Review approved');
  }),

  reject: catchAsync(async (req, res) => {
    const { rejectionReason } = req.body;
    if (!rejectionReason) throw new AppError('Rejection reason required', 400);

    const rejected = await ReviewAdminService.rejectReview(
      req.params.id,
      rejectionReason,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, rejected, 'Review rejected');
  }),

  delete: catchAsync(async (req, res) => {
    const deleted = await ReviewAdminService.deleteReview(req.params.id);
    sendSuccess(res, deleted, 'Review deleted');
  }),

  restore: catchAsync(async (req, res) => {
    const restored = await ReviewAdminService.restoreReview(req.params.id);
    sendSuccess(res, restored, 'Review restored');
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await ReviewAdminService.listReviews(q);
    sendSuccess(res, data);
  }),

  getPending: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
    };
    const data = await ReviewAdminService.getPendingReviews(q);
    sendSuccess(res, data);
  }),
};

module.exports = { ReviewController, ReviewAdminController };
