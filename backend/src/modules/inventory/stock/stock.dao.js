/**
 * Stock DAO
 */

const Stock = require('./stock.model');
const mongoose = require('mongoose');

const StockDAO = {
  async findBySku(sku, session = undefined) {
    const query = Stock.findOne({ sku, isDeleted: false })
      .populate('productId')
      .lean();
    if (session) query.session(session);
    return query.exec();
  },

  async findById(id, session = undefined) {
    if (!mongoose.isValidObjectId(id)) return null;
    const query = Stock.findOne({ _id: id, isDeleted: false })
      .populate('productId')
      .lean();
    if (session) query.session(session);
    return query.exec();
  },

  async findByProductId(productId, session = undefined) {
    const query = Stock.find({ productId, isDeleted: false })
      .lean();
    if (session) query.session(session);
    return query.exec();
  },

  async findLowStockItems(limit = 50, session = undefined) {
    const query = Stock.find({
      isDeleted: false,
      $expr: { $lte: ['$available', '$lowStockThreshold'] },
    })
      .populate('productId')
      .limit(limit)
      .lean();
    if (session) query.session(session);
    return query.exec();
  },

  async list(filter = {}, { page = 1, limit = 20, sort = { createdAt: -1 } } = {}, session = undefined) {
    const skip = (page - 1) * limit;
    const q = Stock.find({ ...filter, isDeleted: false })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    if (session) q.session(session);
    const [items, total] = await Promise.all([
      q.exec(),
      Stock.countDocuments({ ...filter, isDeleted: false }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },
};

const StockAdminDAO = {
  async create(data) {
    const stock = new Stock(data);
    return stock.save();
  },

  async updateById(id, data) {
    return Stock.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  },

  async adjustStock(id, quantity, reference, notes = '') {
    return Stock.findByIdAndUpdate(
      id,
      {
        $inc: { quantity },
        $push: {
          movements: {
            type: 'adjustment',
            quantity: Math.abs(quantity),
            reference,
            notes,
          },
        },
        $set: { lastStockMovement: new Date() },
      },
      { new: true }
    ).exec();
  },

  async reserve(id, quantity, orderId) {
    return Stock.findByIdAndUpdate(
      id,
      {
        $inc: { reserved: quantity },
        $push: {
          movements: {
            type: 'out',
            quantity,
            reference: orderId,
            notes: 'Reservation',
          },
        },
      },
      { new: true }
    ).exec();
  },

  async unreserve(id, quantity, orderId) {
    return Stock.findByIdAndUpdate(
      id,
      {
        $inc: { reserved: -quantity },
        $push: {
          movements: {
            type: 'in',
            quantity,
            reference: orderId,
            notes: 'Unreservation',
          },
        },
      },
      { new: true }
    ).exec();
  },

  async softDelete(id) {
    return Stock.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true }
    ).exec();
  },

  async restore(id) {
    return Stock.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false } },
      { new: true }
    ).exec();
  },
};

module.exports = { StockDAO, StockAdminDAO };
