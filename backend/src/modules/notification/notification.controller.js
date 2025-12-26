const { NotificationService, NotificationAdminService } = require('./notification.service');
const {catchAsync} = require('../../core/catchAsync');
const { sendSuccess } = require('../../core/response');
const AppError = require('../../core/appError');

const NotificationController = {
  getUserNotifications: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      unreadOnly: req.query.unreadOnly === 'true',
    };
    const data = await NotificationService.getUserNotifications(userId, q);
    sendSuccess(res, data);
  }),

  getUnreadNotifications: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const notifications = await NotificationService.getUnreadNotifications(userId);
    sendSuccess(res, notifications);
  }),

  getUnreadCount: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const result = await NotificationService.getUnreadCount(userId);
    sendSuccess(res, result);
  }),

  markAsRead: catchAsync(async (req, res) => {
    const updated = await NotificationService.markAsRead(req.params.id);
    sendSuccess(res, updated, 'Notification marked as read');
  }),

  markAllAsRead: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const result = await NotificationService.markAllAsRead(userId);
    sendSuccess(res, result);
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await NotificationService.listNotifications(q);
    sendSuccess(res, data);
  }),
};

const NotificationAdminController = {
  send: catchAsync(async (req, res) => {
    const notification = await NotificationAdminService.sendNotification(req.body);
    sendSuccess(res, notification, 'Notification sent', 201);
  }),

  sendBulk: catchAsync(async (req, res) => {
    const { userIds, notificationData } = req.body;
    if (!userIds || !notificationData) {
      throw new AppError('userIds and notificationData required', 400);
    }

    const notifications = await NotificationAdminService.sendNotificationToUsers(
      userIds,
      notificationData
    );
    sendSuccess(res, notifications, 'Notifications sent in bulk', 201);
  }),

  updateStatus: catchAsync(async (req, res) => {
    const { status, sentAt, failureReason } = req.body;
    if (!status) throw new AppError('Status required', 400);

    const updated = await NotificationAdminService.updateStatus(
      req.params.id,
      status,
      sentAt,
      failureReason
    );
    sendSuccess(res, updated, 'Notification status updated');
  }),

  delete: catchAsync(async (req, res) => {
    const deleted = await NotificationAdminService.deleteNotification(req.params.id);
    sendSuccess(res, deleted, 'Notification deleted');
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await NotificationAdminService.listNotifications(q);
    sendSuccess(res, data);
  }),

  getPending: catchAsync(async (req, res) => {
    const limit = Number(req.query.limit) || 100;
    const notifications = await NotificationAdminService.getPendingNotifications(limit);
    sendSuccess(res, notifications);
  }),
};

module.exports = { NotificationController, NotificationAdminController };
