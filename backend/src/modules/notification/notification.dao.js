/**
 * Notification DAO
 */

const Notification = require('./notification.model');
const mongoose = require('mongoose');

const NotificationDAO = {
  async findById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Notification.findOne({ _id: id, isDeleted: false })
      .populate('userId')
      .lean()
      .exec();
  },

  async findByUserId(userId, query = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = query;
    const skip = (page - 1) * limit;

    const filter = { userId, isDeleted: false };
    if (unreadOnly) filter.read = false;

    const [items, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Notification.countDocuments(filter),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },

  async findUnread(userId) {
    return Notification.find({ userId, read: false, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

  async countUnread(userId) {
    return Notification.countDocuments({ userId, read: false, isDeleted: false });
  },

  async list(filter = {}, { page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Notification.find({ ...filter, isDeleted: false })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Notification.countDocuments({ ...filter, isDeleted: false }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  },
};

const NotificationAdminDAO = {
  async create(data) {
    const notification = new Notification(data);
    return notification.save();
  },

  async updateById(id, data) {
    return Notification.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  },

  async markAsRead(id) {
    return Notification.findByIdAndUpdate(
      id,
      { $set: { read: true, readAt: new Date() } },
      { new: true }
    ).exec();
  },

  async markAllAsRead(userId) {
    return Notification.updateMany(
      { userId, read: false, isDeleted: false },
      { $set: { read: true, readAt: new Date() } }
    ).exec();
  },

  async updateStatus(id, status, sentAt = null, failureReason = null) {
    const update = { status };
    if (sentAt) update.sentAt = sentAt;
    if (failureReason) update.failureReason = failureReason;

    return Notification.findByIdAndUpdate(
      id,
      { $set: update, $inc: { retryCount: 1 } },
      { new: true }
    ).exec();
  },

  async softDelete(id) {
    return Notification.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true }
    ).exec();
  },

  async bulkSend(notificationIds) {
    return Notification.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { status: 'sent', sentAt: new Date() } }
    ).exec();
  },
};

module.exports = { NotificationDAO, NotificationAdminDAO };
