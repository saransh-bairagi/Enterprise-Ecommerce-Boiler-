/**
 * Order DAO: All database operations for Order.
 * Clean separation from service layer.
 */

const Order = require('./order.model');
const mongoose = require('mongoose');

const OrderDAO = {
  // ──────────────────────────────────────────────────────────────
  // PUBLIC QUERIES
  // ──────────────────────────────────────────────────────────────

  // Convert publicId → _id
  publicIdToId(publicId) {
    return Order.findOne({ publicId, isDeleted: false })
      .select('_id')
      .lean()
      .exec();
  },

  // Find order by database ID
  async findById(id, opts = {}, session = undefined) {
    if (!mongoose.isValidObjectId(id)) return null;
    const query = Order.findOne({ _id: id, isDeleted: false })
      .populate(opts.populate || ['userId', 'items.productId'])
      .lean();
    if (session) query.session(session);
    return query.exec();
  },

  // Find order by publicId
  async findByPublicId(publicId, session = undefined) {
    const query = Order.findOne({ publicId, isDeleted: false })
      .populate(['userId', 'items.productId'])
      .lean();
    if (session) query.session(session);
    return query.exec();
  },

  // Find order by orderNumber
  async findByOrderNumber(orderNumber, session = undefined) {
    const query = Order.findOne({ orderNumber, isDeleted: false })
      .populate(['userId', 'items.productId'])
      .lean();
    if (session) query.session(session);
    return query.exec();
  },

  // Find orders by userId
  async findByUserId(userId, session = undefined) {
    const query = Order.find({ userId, isDeleted: false })
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .lean();
    if (session) query.session(session);
    return query.exec();
  },

  // Generic findOne
  async findOne(filter, opts = {}, session = undefined) {
    const query = Order.findOne({ ...filter, isDeleted: false })
      .lean();
    if (session) query.session(session);
    return query.exec();
  },

  // List orders (pagination)
  async list(
    filter = {},
    { page = 1, limit = 20, sort = { createdAt: -1 }, select = null } = {},
    session = undefined
  ) {
    const skip = (page - 1) * limit;
    const q = Order.find({ ...filter, isDeleted: false });
    if (select) q.select(select);
    q.sort(sort).skip(skip).limit(limit);
    if (session) q.session(session);
    const [items, total] = await Promise.all([
      q.lean().exec(),
      Order.countDocuments({ ...filter, isDeleted: false }),
    ]);
    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  // Get orders by status
  async findByStatus(status, session = undefined) {
    const query = Order.find({ status, isDeleted: false })
      .populate(['userId', 'items.productId'])
      .sort({ createdAt: -1 })
      .lean();
    if (session) query.session(session);
    return query.exec();
  },
};

// ──────────────────────────────────────────────────────────────
// ADMIN DAO
// ──────────────────────────────────────────────────────────────

const OrderAdminDAO = {
  // Create a new order
  async create(data, session = undefined) {
    const order = new Order(data);
    return order.save({ session });
  },

  // Update order by ID
  async updateById(id, data, opts = {}, session = undefined) {
    if (!mongoose.isValidObjectId(id)) return null;
    const finalOpts = {
      new: true,
      runValidators: true,
      ...opts,
      session,
    };
    return Order.findByIdAndUpdate(id, { $set: data }, finalOpts).exec();
  },

  // Update order by publicId
  async updateByPublicId(publicId, data, opts = {}, session = undefined) {
    const orderDoc = await OrderDAO.publicIdToId(publicId);
    if (!orderDoc) return null;
    const finalOpts = {
      new: true,
      runValidators: true,
      ...opts,
      session,
    };
    return Order.findByIdAndUpdate(orderDoc._id, { $set: data }, finalOpts).exec();
  },

  // Update order status
  async updateStatus(id, status, userId, session = undefined) {
    return Order.findByIdAndUpdate(
      id,
      { $set: { status, updatedBy: userId, updatedAt: new Date() } },
      { new: true, session }
    ).exec();
  },

  // Add tracking info
  async addTracking(id, trackingNumber, shippingProvider, session = undefined) {
    return Order.findByIdAndUpdate(
      id,
      { $set: { trackingNumber, shippingProvider } },
      { new: true, session }
    ).exec();
  },

  // Update payment
  async updatePayment(id, paymentData, session = undefined) {
    return Order.findByIdAndUpdate(
      id,
      { $set: { payment: paymentData } },
      { new: true, session }
    ).exec();
  },

  // Soft delete
  async softDelete(id, session = undefined) {
    return Order.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, updatedAt: new Date() } },
      { new: true, session }
    ).exec();
  },

  // Restore order
  async restore(id, session = undefined) {
    return Order.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false } },
      { new: true, session }
    ).exec();
  },

  // Hard delete (permanent)
  async hardDelete(id, session = undefined) {
    return Order.findByIdAndDelete(id, { session }).exec();
  },

  // Pagination for admin
  async paginate(
    filter = {},
    { page = 1, limit = 20, sort = { createdAt: -1 } } = {},
    session = undefined
  ) {
    return OrderDAO.list(filter, { page, limit, sort }, session);
  },

  // Bulk update status
  async bulkUpdateStatus(filters, status, userId, session = undefined) {
    return Order.updateMany(
      { ...filters, isDeleted: false },
      { $set: { status, updatedBy: userId, updatedAt: new Date() } },
      { session }
    ).exec();
  },
};

module.exports = { OrderDAO, OrderAdminDAO };
