const { CartService, CartAdminService } = require('./cart.service');
const catchAsync = require('../../core/catchAsync');
const { sendSuccess } = require('../../core/response');
const AppError = require('../../core/appError');

/* ----------------------------------------------------------
 * USER-FACING CONTROLLERS
 * ----------------------------------------------------------*/
const CartController = {
  getCart: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const cart = await CartService.getCart(userId);
    sendSuccess(res, cart);
  }),

  addItem: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { productId, variantId, sku, quantity, price, mrp } = req.body;
    if (!sku || !quantity || !price) {
      throw new AppError('Missing required fields', 400);
    }

    const itemData = { productId, variantId, sku, quantity, price, mrp };
    const updated = await CartService.addItem(userId, itemData);
    sendSuccess(res, updated, 'Item added to cart', 201);
  }),

  removeItem: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { sku } = req.params;
    const updated = await CartService.removeItem(userId, sku);
    sendSuccess(res, updated, 'Item removed from cart');
  }),

  updateItemQuantity: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { sku } = req.params;
    const { quantity } = req.body;
    if (typeof quantity !== 'number') {
      throw new AppError('Invalid quantity', 400);
    }

    const updated = await CartService.updateItemQuantity(userId, sku, quantity);
    sendSuccess(res, updated, 'Item quantity updated');
  }),

  clearCart: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const cleared = await CartService.clearCart(userId);
    sendSuccess(res, cleared, 'Cart cleared');
  }),

  applyCoupon: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { couponCode } = req.body;
    if (!couponCode) throw new AppError('Coupon code required', 400);

    const updated = await CartService.applyCoupon(userId, couponCode);
    sendSuccess(res, updated, 'Coupon applied');
  }),

  removeCoupon: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const updated = await CartService.removeCoupon(userId);
    sendSuccess(res, updated, 'Coupon removed');
  }),
};

/* ----------------------------------------------------------
 * ADMIN CONTROLLERS
 * ----------------------------------------------------------*/
const CartAdminController = {
  create: catchAsync(async (req, res) => {
    const payload = { ...req.body, createdBy: req.attachedSECRET?.userId };
    const created = await CartAdminService.createCart(payload);
    sendSuccess(res, created, 'Cart created', 201);
  }),

  update: catchAsync(async (req, res) => {
    const updated = await CartAdminService.updateCart(
      req.params.publicId,
      req.body,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, updated, 'Cart updated');
  }),

  delete: catchAsync(async (req, res) => {
    const deleted = await CartAdminService.deleteCart(
      req.params.publicId,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, deleted, 'Cart deleted');
  }),

  restore: catchAsync(async (req, res) => {
    const restored = await CartAdminService.restoreCart(req.params.publicId);
    sendSuccess(res, restored, 'Cart restored');
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await CartAdminService.listCarts(q);
    sendSuccess(res, data);
  }),
};

module.exports = { CartController, CartAdminController };
