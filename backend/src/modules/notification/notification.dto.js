/**
 * Notification DTO
 */

function notificationDTO(notification) {
  if (!notification) return null;

  return {
    id: notification._id || notification.id,
    publicId: notification.publicId,
    userId: notification.userId,
    type: notification.type,
    category: notification.category,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    readAt: notification.readAt,
    status: notification.status,
    sentAt: notification.sentAt,
    sendAt: notification.sendAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

function notificationsDTO(notifications = []) {
  return notifications.map(notificationDTO);
}

module.exports = {
  notificationDTO,
  notificationsDTO,
};
