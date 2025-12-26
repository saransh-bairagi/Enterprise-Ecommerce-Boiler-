/**
 * Notification Service
 */

const { NotificationDAO, NotificationAdminDAO } = require('./notification.dao');
const { notificationDTO } = require('./notification.dto');
const AppError = require('../../core/appError');

const NotificationService = {
  getUserNotifications: async (userId, query = {}) => {
    const res = await NotificationDAO.findByUserId(userId, query);
    res.items = res.items.map(notificationDTO);
    return res;
  },

  getUnreadNotifications: async (userId) => {
    const notifications = await NotificationDAO.findUnread(userId);
    return notifications.map(notificationDTO);
  },

  getUnreadCount: async (userId) => {
    const count = await NotificationDAO.countUnread(userId);
    return { unreadCount: count };
  },

  markAsRead: async (notificationId) => {
    const updated = await NotificationAdminDAO.markAsRead(notificationId);
    if (!updated) throw new AppError('Notification not found', 404);
    return notificationDTO(updated);
  },

  markAllAsRead: async (userId) => {
    const result = await NotificationAdminDAO.markAllAsRead(userId);
    return { markedCount: result.modifiedCount };
  },

  listNotifications: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await NotificationDAO.list(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(notificationDTO);
    return res;
  },
};

const NotificationAdminService = {
  sendNotification: async (data) => {
    // Integrate with email/SMS/push providers
    const { sendEmail } = require('../../utils/email');
    const { sendSMS } = require('../../utils/sms');
    const { sendPush } = require('../../utils/push');
    let status = 'sent';
    let failureReason = null;
    try {
      if (data.type === 'email' && data.email) {
        await sendEmail({ to: data.email, subject: data.subject, text: data.body, html: data.html });
      } else if (data.type === 'sms' && data.phone) {
        await sendSMS(data.phone, data.body);
      } else if (data.type === 'push' && data.deviceToken) {
        await sendPush(data.deviceToken, { title: data.subject, body: data.body });
      } else {
        status = 'failed';
        failureReason = 'Unsupported notification type or missing recipient';
      }
    } catch (err) {
      status = 'failed';
      failureReason = err.message || 'Provider error';
    }
    const created = await NotificationAdminDAO.create({
      ...data,
      status,
      failureReason,
    });
    return notificationDTO(created);
  },

  sendNotificationToUsers: async (userIds, notificationData) => {
    const notifications = await Promise.all(
      userIds.map(userId =>
        NotificationAdminDAO.create({
          ...notificationData,
          userId,
          status: 'pending',
        })
      )
    );
    return notifications.map(notificationDTO);
  },

  updateStatus: async (notificationId, status, sentAt = null, failureReason = null) => {
    const updated = await NotificationAdminDAO.updateStatus(
      notificationId,
      status,
      sentAt,
      failureReason
    );
    if (!updated) throw new AppError('Notification not found', 404);
    return notificationDTO(updated);
  },

  deleteNotification: async (notificationId) => {
    const deleted = await NotificationAdminDAO.softDelete(notificationId);
    if (!deleted) throw new AppError('Notification not found', 404);
    return notificationDTO(deleted);
  },

  listNotifications: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await NotificationDAO.list(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(notificationDTO);
    return res;
  },

  getPendingNotifications: async (limit = 100) => {
    const notifications = await NotificationDAO.findByUserId('*', {
      limit,
    }).then(res => res.items);
    
    const pending = notifications.filter(n => n.status === 'pending');
    return pending.map(notificationDTO);
  },
};

module.exports = { NotificationService, NotificationAdminService };
