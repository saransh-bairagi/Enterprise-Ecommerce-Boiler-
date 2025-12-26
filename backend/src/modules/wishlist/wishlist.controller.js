const WishlistService = require('./wishlist.service');
const catchAsync = require('../../core/catchAsync');
const { sendSuccess } = require('../../core/response');
const AppError = require('../../core/appError');

const WishlistController = {
  get: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const wishlist = await WishlistService.getWishlistByUser(userId);
    sendSuccess(res, wishlist);
  }),
  add: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const { productId } = req.body;
    if (!productId) throw new AppError('Product ID required', 400);
    const wishlist = await WishlistService.addItem(userId, productId);
    sendSuccess(res, wishlist, 'Product added to wishlist');
  }),
  remove: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const { productId } = req.body;
    if (!productId) throw new AppError('Product ID required', 400);
    const wishlist = await WishlistService.removeItem(userId, productId);
    sendSuccess(res, wishlist, 'Product removed from wishlist');
  }),
  delete: catchAsync(async (req, res) => {
    const { id } = req.params;
    await WishlistService.deleteWishlist(id);
    sendSuccess(res, null, 'Wishlist deleted');
  })
};

module.exports = WishlistController;
