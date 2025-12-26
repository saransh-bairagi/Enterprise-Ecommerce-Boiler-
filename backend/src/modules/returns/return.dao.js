/**
 * Return DAO
 */

const Return = require('./return.model');
const mongoose = require('mongoose');

const ReturnDAO = {
  async findById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Return.findOne({ _id: id, isDeleted: false })
      .populate(['orderId', 'userId'])
      .lean()
      .exec();
  },

  async findByReturnNumber(returnNumber) {
    return Return.findOne({ returnNumber, isDeleted: false })
      .populate(['orderId', 'userId'])
      .lean()
      .exec();
  },

  async findByOrderId(orderId) {
    return Return.find({ orderId, isDeleted: false })
      .lean()
      .exec();
  },

  async findByUserId(userId, query = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Return.find({ userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Return.countDocuments({ userId, isDeleted: false }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async list(filter = {}, { page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Return.find({ ...filter, isDeleted: false })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Return.countDocuments({ ...filter, isDeleted: false }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },
};

const ReturnAdminDAO = {
  async create(data) {
    const ret = new Return(data);
    return ret.save();
  },

  async updateById(id, data) {
    return Return.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  },

  async updateStatus(id, status, notes = '') {
    const updateData = { status };
    if (status === 'received') updateData.receivedAt = new Date();
    if (status === 'inspected') updateData.inspectedAt = new Date();
    if (status === 'approved') updateData.approvedAt = new Date();
    if (status === 'refunded') updateData.refundedAt = new Date();
    if (notes) updateData.inspectionNotes = notes;

    return Return.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();
  },

  async approveReturn(id, approvedBy) {
    return Return.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'approved',
          refundStatus: 'approved',
          approvedBy,
          approvedAt: new Date(),
        },
      },
      { new: true }
    ).exec();
  },

  async rejectReturn(id, rejectionReason, approvedBy) {
    return Return.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'rejected',
          refundStatus: 'rejected',
          rejectionReason,
          approvedBy,
        },
      },
      { new: true }
    ).exec();
  },

  async processRefund(id) {
    return Return.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'refunded',
          refundStatus: 'processed',
          refundedAt: new Date(),
        },
      },
      { new: true }
    ).exec();
  },

  async softDelete(id) {
    return Return.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true }
    ).exec();
  },

  async restore(id) {
    return Return.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false } },
      { new: true }
    ).exec();
  },
};

module.exports = { ReturnDAO, ReturnAdminDAO };
