const { PromoService, PromoAdminService } = require('./promo.service');
const {catchAsync} = require('../../core/catchAsync');
const { sendSuccess } = require('../../core/response');
const AppError = require('../../core/appError');

const PromoController = {
  getPromo: catchAsync(async (req, res) => {
    const promo = await PromoService.getPromo(req.params.publicId);
    sendSuccess(res, promo);
  }),

  listActive: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
    };
    const data = await PromoService.listActive(q);
    sendSuccess(res, data);
  }),

  trackClick: catchAsync(async (req, res) => {
    const updated = await PromoService.trackClick(req.params.publicId);
    sendSuccess(res, updated);
  }),

  trackImpression: catchAsync(async (req, res) => {
    const updated = await PromoService.trackImpression(req.params.publicId);
    sendSuccess(res, updated);
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await PromoService.listPromos(q);
    sendSuccess(res, data);
  }),
};

const PromoAdminController = {
  create: catchAsync(async (req, res) => {
    const payload = { ...req.body, createdBy: req.attachedSECRET?.userId };
    const created = await PromoAdminService.createPromo(payload);
    sendSuccess(res, created, 'Promo created', 201);
  }),

  update: catchAsync(async (req, res) => {
    const updated = await PromoAdminService.updatePromo(
      req.params.publicId,
      req.body,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, updated, 'Promo updated');
  }),

  delete: catchAsync(async (req, res) => {
    const deleted = await PromoAdminService.deletePromo(req.params.publicId);
    sendSuccess(res, deleted, 'Promo deleted');
  }),

  restore: catchAsync(async (req, res) => {
    const restored = await PromoAdminService.restorePromo(req.params.publicId);
    sendSuccess(res, restored, 'Promo restored');
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await PromoAdminService.listPromos(q);
    sendSuccess(res, data);
  }),
};

module.exports = { PromoController, PromoAdminController };
