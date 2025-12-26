/**
 * Cart DAO: All database operations for Cart.
 * Clean separation from service layer.
 */

const Cart = require('./cart.model');
const mongoose = require('mongoose');

const CartDAO = {
  // ──────────────────────────────────────────────────────────────
  // PUBLIC QUERIES
  // ──────────────────────────────────────────────────────────────

  // Convert publicId → _id
  publicIdToId(publicId) {
    return Cart.findOne({ publicId, isDeleted: false })
      .select('_id')
      .lean()
      .exec();
  },

  // Find cart by database ID
  async findById(id, opts = {}) {
    if (!mongoose.isValidObjectId(id)) return null;

    return Cart.findOne({ _id: id, isDeleted: false })
      .populate(opts.populate || [])
      .lean()
      .exec();
  },

  // Find cart by userId
  async findByUserId(userId) {
    return Cart.findOne({ userId, isDeleted: false })
      .populate('items.productId')
      .lean()
      .exec();
  },

  // Find cart by publicId
  async findByPublicId(publicId) {
    return Cart.findOne({ publicId, isDeleted: false })
      .populate('items.productId')
      .lean()
      .exec();
  },

  // Generic findOne
  async findOne(filter, opts = {}) {
    return Cart.findOne({ ...filter, isDeleted: false })
      .lean()
      .exec();
  },

  // List carts (pagination)
  async list(
    filter = {},
    { page = 1, limit = 20, sort = { createdAt: -1 }, select = null } = {}
  ) {
    const skip = (page - 1) * limit;

    const q = Cart.find({ ...filter, isDeleted: false });
    if (select) q.select(select);
    q.sort(sort).skip(skip).limit(limit);

    const [items, total] = await Promise.all([
      q.lean().exec(),
      Cart.countDocuments({ ...filter, isDeleted: false }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },
};

// ──────────────────────────────────────────────────────────────
// ADMIN DAO
// ──────────────────────────────────────────────────────────────

const CartAdminDAO = {
  // Create a new cart
  async create(data) {
    const cart = new Cart(data);
    return cart.save();
  },

  // Update cart by ID
  async updateById(id, data, opts = {}) {
    if (!mongoose.isValidObjectId(id)) return null;
    
    const finalOpts = {
      new: true,
      runValidators: true,
      ...opts,
    };

    return Cart.findByIdAndUpdate(id, { $set: data }, finalOpts)
      .exec();
  },

  // Update cart by publicId
  async updateByPublicId(publicId, data, opts = {}) {
    const cartDoc = await CartDAO.publicIdToId(publicId);
    if (!cartDoc) return null;

    const finalOpts = {
      new: true,
      runValidators: true,
      ...opts,
    };

    return Cart.findByIdAndUpdate(cartDoc._id, { $set: data }, finalOpts)
      .exec();
  },

  // Add item to cart
  async addItem(userId, item) {
    return Cart.findOneAndUpdate(
      { userId, isDeleted: false },
      { $push: { items: item } },
      { new: true, upsert: true }
    ).exec();
  },

  // Remove item from cart
  async removeItem(userId, sku) {
    return Cart.findOneAndUpdate(
      { userId, isDeleted: false },
      { $pull: { items: { sku } } },
      { new: true }
    ).exec();
  },

  // Update item quantity
  async updateItemQuantity(userId, sku, quantity) {
    return Cart.findOneAndUpdate(
      { userId, isDeleted: false, 'items.sku': sku },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    ).exec();
  },

  // Clear cart
  async clearCart(userId) {
    return Cart.findOneAndUpdate(
      { userId, isDeleted: false },
      {
        $set: {
          items: [],
          totalItems: 0,
          subtotal: 0,
          discount: 0,
          tax: 0,
          total: 0,
          couponCode: null,
          couponDiscount: 0,
        },
      },
      { new: true }
    ).exec();
  },

  // Soft delete
  async softDelete(id) {
    return Cart.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, lastModifiedAt: new Date() } },
      { new: true }
    ).exec();
  },

  // Restore cart
  async restore(id) {
    return Cart.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false } },
      { new: true }
    ).exec();
  },

  // Hard delete (permanent)
  async hardDelete(id) {
    return Cart.findByIdAndDelete(id).exec();
  },

  // Pagination for admin
  async paginate(
    filter = {},
    { page = 1, limit = 20, sort = { createdAt: -1 } } = {}
  ) {
    return CartDAO.list(filter, { page, limit, sort });
  },
};

module.exports = { CartDAO, CartAdminDAO };
