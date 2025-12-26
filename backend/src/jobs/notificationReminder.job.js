// backend/src/jobs/notificationReminder.job.js
const logger = require('../config/logger');
const { sendPendingReminders } = require('../modules/notification/notification.service');

/**
 * Notification Reminder Job
 * Sends notification reminders every hour
 */
async function processNotificationRemindersJob() {
  try {
    logger.info('[NotificationReminderJob] Sending notification reminders...');
    const result = await sendPendingReminders();
    logger.info(`[NotificationReminderJob] ✅ Reminders sent: ${result.count || 0}`);
    return result;
  } catch (error) {
    logger.error('[NotificationReminderJob] Notification reminder failed:', error);
    throw error;
  }
}

module.exports = { processNotificationRemindersJob };
