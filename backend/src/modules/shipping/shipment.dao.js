/**
 * Shipment DAO
 */

const Shipment = require('./shipment.model');
const mongoose = require('mongoose');

const ShipmentDAO = {
  async findById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Shipment.findOne({ _id: id, isDeleted: false })
      .populate(['orderId', 'userId'])
      .lean()
      .exec();
  },

  async findByTrackingNumber(trackingNumber) {
    return Shipment.findOne({ trackingNumber, isDeleted: false })
      .lean()
      .exec();
  },

  async findByOrderId(orderId) {
    return Shipment.findOne({ orderId, isDeleted: false })
      .lean()
      .exec();
  },

  async findByUserId(userId, query = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Shipment.find({ userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Shipment.countDocuments({ userId, isDeleted: false }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async list(filter = {}, { page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Shipment.find({ ...filter, isDeleted: false })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Shipment.countDocuments({ ...filter, isDeleted: false }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },
};

const ShipmentAdminDAO = {
  async create(data) {
    const shipment = new Shipment(data);
    return shipment.save();
  },

  async updateById(id, data) {
    return Shipment.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  },

  async updateStatus(id, status) {
    return Shipment.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          actualDeliveryDate: status === 'delivered' ? new Date() : null,
        },
      },
      { new: true }
    ).exec();
  },

  async addTracking(id, trackingNumber, shippingProvider) {
    return Shipment.findByIdAndUpdate(
      id,
      { $set: { trackingNumber, shippingProvider, status: 'shipped' } },
      { new: true }
    ).exec();
  },

  async softDelete(id) {
    return Shipment.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true }
    ).exec();
  },

  async restore(id) {
    return Shipment.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false } },
      { new: true }
    ).exec();
  },
};

module.exports = { ShipmentDAO, ShipmentAdminDAO };
