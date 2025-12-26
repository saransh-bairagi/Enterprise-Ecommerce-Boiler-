const router = require('express').Router();

const { NotificationController, NotificationAdminController } = require('./notification.controller');
const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');

// ----------------------------------------------------------
// USER-FACING ROUTES (LOGGED-IN)
// ----------------------------------------------------------

// Get user notifications
router.get('/', auth, NotificationController.getUserNotifications);

// Get unread notifications
router.get('/unread', auth, NotificationController.getUnreadNotifications);

// Get unread count
router.get('/unread/count', auth, NotificationController.getUnreadCount);

// Mark notification as read
router.patch('/:id/read', auth, NotificationController.markAsRead);

// Mark all as read
router.patch('/read/all', auth, NotificationController.markAllAsRead);

// ----------------------------------------------------------
// ADMIN ROUTES (PROTECTED - ADMIN)
// ----------------------------------------------------------

/**
 * SEND NOTIFICATION
 */
router.post('/admin/send', auth, rbac('admin'), NotificationAdminController.send);

/**
 * SEND BULK NOTIFICATIONS
 */
router.post(
  '/admin/send-bulk',
  auth,
  rbac('admin'),
  NotificationAdminController.sendBulk
);

/**
 * UPDATE NOTIFICATION STATUS
 */
router.patch(
  '/admin/:id/status',
  auth,
  rbac('admin'),
  NotificationAdminController.updateStatus
);

/**
 * DELETE NOTIFICATION
 */
router.delete('/admin/:id', auth, rbac('admin'), NotificationAdminController.delete);

/**
 * LIST NOTIFICATIONS (Admin)
 */
router.get('/admin/list', auth, rbac('admin'), NotificationAdminController.list);

/**
 * GET PENDING NOTIFICATIONS
 */
router.get(
  '/admin/pending',
  auth,
  rbac('admin'),
  NotificationAdminController.getPending
);

module.exports = router;
