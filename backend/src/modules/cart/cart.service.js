/**
 * Cart + Cart Admin Service
 * Business logic layer.
 */

const { CartDAO, CartAdminDAO } = require("./cart.dao");
const AppError = require("../../core/appError");
const { cartDTO } = require("./cart.dto");
const _ = require("lodash");
const Cart = require("./cart.model");
const ERROR = require("../../core/constants").ERRORS;
const logger = require("../../config/logger");

// In-memory idempotency stores for admin actions (replace with persistent store in production)
const cartCreateIdempotencyStore = new Map();
const cartUpdateIdempotencyStore = new Map();
const cartDeleteIdempotencyStore = new Map();
const cartRestoreIdempotencyStore = new Map();
const { CouponService } = require('../coupons/coupon.service');

/* ----------------------------------------------------------
 * USER-FACING CART SERVICE
 * ----------------------------------------------------------*/
const CartService = {
    // Get cart by user ID
    getCart: async (userId) => {
        const cart = await CartDAO.findByUserId(userId);
        if (!cart)
            throw new AppError(ERROR.CART_NOT_FOUND || "Cart not found", 404);
        return cartDTO(cart);
    },

    // Get cart by publicId
    getCartByPublicId: async (publicId) => {
        const cart = await CartDAO.findByPublicId(publicId);
        if (!cart)
            throw new AppError(ERROR.CART_NOT_FOUND || "Cart not found", 404);
        return cartDTO(cart);
    },

    // Add item to cart
    addItem: async (userId, itemData) => {
        let cart = await CartDAO.findByUserId(userId);

        if (!cart) {
            // Create new cart if doesn't exist
            cart = await CartAdminDAO.create({
                userId,
                items: [itemData],
            });
        } else {
            // Add item to existing cart
            const existingItem = cart.items.find((i) => i.sku === itemData.sku);
            if (existingItem) {
                existingItem.quantity += itemData.quantity;
            } else {
                cart.items.push(itemData);
            }
        }

        // Recalculate totals
        await cart.calculateTotals();
        return cartDTO(cart);
    },

    // Remove item from cart
    removeItem: async (userId, sku) => {
        const cart = await CartDAO.findByUserId(userId);
        if (!cart)
            throw new AppError(ERROR.CART_NOT_FOUND || "Cart not found", 404);

        const updated = await CartAdminDAO.removeItem(userId, sku);
        if (updated) await updated.calculateTotals();
        return cartDTO(updated);
    },

    // Update item quantity
    updateItemQuantity: async (userId, sku, quantity) => {
        if (quantity <= 0) {
            return CartService.removeItem(userId, sku);
        }

        const cart = await CartDAO.findByUserId(userId);
        if (!cart)
            throw new AppError(ERROR.CART_NOT_FOUND || "Cart not found", 404);

        const updated = await CartAdminDAO.updateItemQuantity(
            userId,
            sku,
            quantity
        );
        if (updated) await updated.calculateTotals();
        return cartDTO(updated);
    },

    // Clear entire cart
    clearCart: async (userId) => {
        const cart = await CartDAO.findByUserId(userId);
        if (!cart)
            throw new AppError(ERROR.CART_NOT_FOUND || "Cart not found", 404);

        const updated = await CartAdminDAO.clearCart(userId);
        return cartDTO(updated);
    },

    // Apply coupon code
    applyCoupon: async (userId, couponCode) => {
        // Integrate with coupon service
        const cart = await CartDAO.findByUserId(userId);
        if (!cart)
            throw new AppError(ERROR.CART_NOT_FOUND || "Cart not found", 404);

        // Calculate cart subtotal before discount
        const subtotal = (cart.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let coupon;
        let discount = 0;
        try {
            coupon = await CouponService.validateCoupon(couponCode, subtotal);
            const discountResult = await CouponService.calculateDiscount(couponCode, subtotal);
            discount = discountResult.discount;
        } catch (err) {
            throw new AppError(err.message || 'Invalid coupon', 400);
        }
        cart.couponCode = couponCode;
        cart.couponDiscount = discount;
        await cart.calculateTotals();
        return cartDTO(cart);
    },

    // Remove coupon
    removeCoupon: async (userId) => {
        const cart = await CartDAO.findByUserId(userId);
        if (!cart)
            throw new AppError(ERROR.CART_NOT_FOUND || "Cart not found", 404);

        cart.couponCode = null;
        cart.couponDiscount = 0;
        await cart.calculateTotals();
        return cartDTO(cart);
    },

    // List user carts
    listCarts: async (query = {}) => {
        const { page = 1, limit = 20, filters = {} } = query;
        const res = await CartDAO.list(filters, {
            page,
            limit,
            sort: { createdAt: -1 },
        });
        res.items = res.items.map(cartDTO);
        return res;
    },
};

/* ----------------------------------------------------------
 * ADMIN SERVICE (full control)
 * ----------------------------------------------------------*/
const CartAdminService = {
    createCart: async (data, idempotencyKey) => {
        if (idempotencyKey && cartCreateIdempotencyStore.has(idempotencyKey)) {
            logger.info(
                `[IDEMPOTENCY] Returning cached cart for key: ${idempotencyKey}`
            );
            return cartDTO(cartCreateIdempotencyStore.get(idempotencyKey));
        }
        const created = await CartAdminDAO.create(data);
        if (idempotencyKey) {
            cartCreateIdempotencyStore.set(idempotencyKey, created);
            logger.info(`[IDEMPOTENCY] Stored cart for key: ${idempotencyKey}`);
        }
        return cartDTO(created);
    },

    updateCart: async (publicId, update, userId, idempotencyKey) => {
        const key = idempotencyKey ? `${publicId}:${idempotencyKey}` : null;
        if (key && cartUpdateIdempotencyStore.has(key)) {
            logger.info(
                `[IDEMPOTENCY] Returning cached cart update for key: ${key}`
            );
            return cartDTO(cartUpdateIdempotencyStore.get(key));
        }
        const cartDoc = await CartDAO.publicIdToId(publicId);
        if (!cartDoc)
            throw new AppError(ERROR.CART_NOT_FOUND || "Cart not found", 404);
        const updated = await CartAdminDAO.updateById(
            cartDoc._id,
            { ...update, updatedBy: userId },
            { new: true }
        );
        if (key) {
            cartUpdateIdempotencyStore.set(key, updated);
            logger.info(`[IDEMPOTENCY] Stored cart update for key: ${key}`);
        }
        return cartDTO(updated);
    },

    deleteCart: async (publicId, userId, idempotencyKey) => {
        const key = idempotencyKey ? `${publicId}:${idempotencyKey}` : null;
        if (key && cartDeleteIdempotencyStore.has(key)) {
            logger.info(
                `[IDEMPOTENCY] Returning cached cart delete for key: ${key}`
            );
            return cartDTO(cartDeleteIdempotencyStore.get(key));
        }
        const cartDoc = await CartDAO.publicIdToId(publicId);
        if (!cartDoc)
            throw new AppError(ERROR.CART_NOT_FOUND || "Cart not found", 404);
        const deleted = await CartAdminDAO.softDelete(cartDoc._id);
        if (!deleted)
            throw new AppError(ERROR.CART_NOT_FOUND || "Cart not found", 404);
        if (key) {
            cartDeleteIdempotencyStore.set(key, { ok: true });
            logger.info(`[IDEMPOTENCY] Stored cart delete for key: ${key}`);
        }
        return { ok: true };
    },
};
