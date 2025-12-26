/**
 * Promo Service
 */

const { PromoDAO, PromoAdminDAO } = require('./promo.dao');
const { promoDTO } = require('./promo.dto');
const AppError = require('../../core/appError');

const PromoService = {
  getPromo: async (publicId) => {
    const promo = await PromoDAO.findByPublicId(publicId);
    if (!promo) throw new AppError('Promo not found', 404);
    return promoDTO(promo);
  },

  listActive: async (query = {}) => {
    const res = await PromoDAO.findActive(query);
    res.items = res.items.map(promoDTO);
    return res;
  },

  trackClick: async (publicId) => {
    const promo = await PromoDAO.findByPublicId(publicId);
    if (!promo) throw new AppError('Promo not found', 404);

    const updated = await PromoAdminDAO.incrementClick(promo._id);
    return promoDTO(updated);
  },

  trackImpression: async (publicId) => {
    const promo = await PromoDAO.findByPublicId(publicId);
    if (!promo) throw new AppError('Promo not found', 404);

    const updated = await PromoAdminDAO.incrementImpression(promo._id);
    return promoDTO(updated);
  },

  listPromos: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await PromoDAO.list(filters, {
      page,
      limit,
      sort: { position: 1, createdAt: -1 },
    });
    res.items = res.items.map(promoDTO);
    return res;
  },
};

const PromoAdminService = {
  createPromo: async (data) => {
    const created = await PromoAdminDAO.create(data);
    return promoDTO(created);
  },

  updatePromo: async (publicId, update, userId) => {
    const promoDoc = await PromoDAO.findByPublicId(publicId);
    if (!promoDoc) throw new AppError('Promo not found', 404);

    const updated = await PromoAdminDAO.updateById(promoDoc._id, update);
    return promoDTO(updated);
  },

  deletePromo: async (publicId) => {
    const promoDoc = await PromoDAO.findByPublicId(publicId);
    if (!promoDoc) throw new AppError('Promo not found', 404);

    const deleted = await PromoAdminDAO.softDelete(promoDoc._id);
    return promoDTO(deleted);
  },

  restorePromo: async (publicId) => {
    const promoDoc = await PromoDAO.findByPublicId(publicId);
    if (!promoDoc) throw new AppError('Promo not found', 404);

    const restored = await PromoAdminDAO.restore(promoDoc._id);
    return promoDTO(restored);
  },

  listPromos: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await PromoDAO.list(filters, {
      page,
      limit,
      sort: { position: 1, createdAt: -1 },
    });
    res.items = res.items.map(promoDTO);
    return res;
  },
};

module.exports = { PromoService, PromoAdminService };
