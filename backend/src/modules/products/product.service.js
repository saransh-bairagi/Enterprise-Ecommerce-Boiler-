/**
 * PRODUCT + PRODUCT ADMIN SERVICE
 * Business logic layer.
 */

const { ProductDAO, ProductAdminDAO } = require("./product.dao");
const AppError = require("../../core/appError");
const { productDTO } = require("./product.dto");
const Product = require("./product.model");
const ERROR = require("../../core/constants").ERRORS;
const path = require("path");
const fs = require("fs");
const logger = require("../../config/logger");

// In-memory idempotency store for product creation (replace with persistent store in production)
const productIdempotencyStore = new Map();

// In-memory idempotency stores for admin actions (replace with persistent store in production)
const productUpdateIdempotencyStore = new Map();
const productDeleteIdempotencyStore = new Map();
const productRestoreIdempotencyStore = new Map();
const productAdjustStockIdempotencyStore = new Map();

/* ----------------------------------------------------------
 * USER-FACING PRODUCT SERVICE
 * ----------------------------------------------------------*/
const ProductService = {
    getProduct: async (idOrSlug, { by = "publicId" } = {}) => {
        const product =
            by === "slug"
                ? await ProductDAO.findBySlug(idOrSlug)
                : await ProductDAO.findByPublicId(idOrSlug);

        if (!product) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);

        await ProductDAO.incrementViews(product._id);
        return productDTO(product);
    },

    listProducts: async (query = {}) => {
        const {
            page = 1,
            limit = 20,
            sortBy = "-createdAt",
            filters = {},
        } = query;

        const sort = {};
        sortBy.startsWith("-")
            ? (sort[sortBy.slice(1)] = -1)
            : (sort[sortBy] = 1);

        const res = await ProductDAO.list(filters, { page, limit, sort });
        res.items = res.items.map(productDTO);
        return res;
    },

    searchProducts: async (text, query = {}) => {
        const res = await ProductDAO.searchText(text, query);
        res.items = res.items.map(productDTO);
        return res;
    },

    getRelated: async (productId, limit = 8) => {
        const systemId = await ProductDAO.publicIdtoId(productId);
        if (!systemId) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);

        const p = await ProductDAO.findById(systemId._id);
        if (!p) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);

        const list = await Product.find({
            _id: { $ne: p._id },
            categories: { $in: p.categories },
            isDeleted: false,
        })
            .limit(limit)
            .lean();

        return list.map(productDTO);
    },

    addReviewByPublicId: async (productId, reviewPayload) => {
        const updated = await ProductDAO.addReviewByPublicId(
            productId,
            reviewPayload
        );
        return productDTO(updated);
    },

    addReviewBySlug: async (slug, reviewPayload) => {
        const updated = await ProductDAO.addReviewBySlug(slug, reviewPayload);
        return productDTO(updated);
    },
};

/* ----------------------------------------------------------
 * ADMIN SERVICE (FULL CONTROL)
 * ----------------------------------------------------------*/
const ProductAdminService = {
    createProduct: async (data, idempotencyKey) => {
        if (idempotencyKey) {
            if (productIdempotencyStore.has(idempotencyKey)) {
                logger.info(
                    `[IDEMPOTENCY] Returning cached product for key: ${idempotencyKey}`
                );
                return productDTO(productIdempotencyStore.get(idempotencyKey));
            }
        }
        const existing = await ProductDAO.findBySlug(data.slug);
        if (existing) throw new AppError(ERROR.SLUG_EXISTS, 409);

        const created = await ProductAdminDAO.createProduct(data);
        if (idempotencyKey) {
            productIdempotencyStore.set(idempotencyKey, created);
            logger.info(
                `[IDEMPOTENCY] Stored product for key: ${idempotencyKey}`
            );
        }
        logger.info(
            `[AUDIT] Product created: { id: ${created._id}, slug: ${
                created.slug
            }, createdBy: ${created.createdBy || "N/A"} }`
        );
        return productDTO(created);
    },

    updateProduct: async (publicId, update, userId, idempotencyKey) => {
        if (idempotencyKey) {
            const key = `${publicId}:${idempotencyKey}`;
            if (productUpdateIdempotencyStore.has(key)) {
                logger.info(
                    `[IDEMPOTENCY] Returning cached product update for key: ${key}`
                );
                return productDTO(productUpdateIdempotencyStore.get(key));
            }
        }
        const systemId = await ProductDAO.publicIdtoId(publicId);
        if (!systemId) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);

        if (update.slug) {
            const existing = await ProductDAO.findBySlug(update.slug);
            if (
                existing &&
                existing._id.toString() !== systemId._id.toString()
            ) {
                throw new AppError(ERROR.SLUG_EXISTS, 409);
            }
        }
        update.updatedBy = userId;

        const updated = await ProductAdminDAO.updateById(systemId._id, update);
        if (!updated) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);

        if (idempotencyKey) {
            const key = `${publicId}:${idempotencyKey}`;
            productUpdateIdempotencyStore.set(key, updated);
            logger.info(`[IDEMPOTENCY] Stored product update for key: ${key}`);
        }
        logger.info(
            `[AUDIT] Product updated: { id: ${
                systemId._id
            }, updatedBy: ${userId}, update: ${JSON.stringify(update)} }`
        );
        return productDTO(updated);
    },

    deleteProduct: async (publicId, userId, idempotencyKey) => {
        if (idempotencyKey) {
            const key = `${publicId}:${idempotencyKey}`;
            if (productDeleteIdempotencyStore.has(key)) {
                logger.info(
                    `[IDEMPOTENCY] Returning cached product delete for key: ${key}`
                );
                return productDeleteIdempotencyStore.get(key);
            }
        }
        const deleted = await ProductAdminDAO.softDelete(publicId, userId);
        if (!deleted)
            throw new AppError(ERROR.PRODUCT_NOT_FOUND_OR_ISDELETED, 404);
        if (idempotencyKey) {
            const key = `${publicId}:${idempotencyKey}`;
            productDeleteIdempotencyStore.set(key, { ok: true });
            logger.info(`[IDEMPOTENCY] Stored product delete for key: ${key}`);
        }
        logger.info(
            `[AUDIT] Product soft deleted: { publicId: ${publicId}, deletedBy: ${userId} }`
        );
        return { ok: true };
    },

    restoreProduct: async (publicId, idempotencyKey) => {
        if (idempotencyKey) {
            const key = `${publicId}:${idempotencyKey}`;
            if (productRestoreIdempotencyStore.has(key)) {
                logger.info(
                    `[IDEMPOTENCY] Returning cached product restore for key: ${key}`
                );
                return productDTO(productRestoreIdempotencyStore.get(key));
            }
        }
        const restored = await ProductAdminDAO.restore(publicId);
        if (!restored) throw new AppError(ERROR.PRODUCT_NOT_FOUND, 404);
        if (idempotencyKey) {
            const key = `${publicId}:${idempotencyKey}`;
            productRestoreIdempotencyStore.set(key, restored);
            logger.info(`[IDEMPOTENCY] Stored product restore for key: ${key}`);
        }
        logger.info(
            `[AUDIT] Product restored: { publicId: ${publicId}, restoredBy: ${
                restored.updatedBy || "N/A"
            } }`
        );
        return productDTO(restored);
    },
};
