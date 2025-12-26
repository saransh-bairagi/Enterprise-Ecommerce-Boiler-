const cron = require('node-cron');
const logger = require('../config/logger');

const { syncInventory, syncLowStockAlerts } = require('./inventorySync.job');
const { cleanUpOrders, processOrders, validateOrders } = require('./orderCleanup.job');
const { generateReport, generateWeeklyReport } = require('./reportGenerator.job');
const { syncPayments, reconcilePayments, handleFailedPayments } = require('./paymentSync.job');
const { generateAnalyticsReport, updateAnalytics, getDashboardMetrics } = require('./analytics.job');

class SchedulerManager {
  constructor() {
    this.tasks = [];
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) {
      logger.warn('[Scheduler] Already initialized');
      return;
    }

    try {
      this.registerInventorySyncScheduler();
      this.registerOrderProcessorScheduler();
      this.registerPaymentSyncScheduler();
      this.registerAnalyticsScheduler();
      this.registerReportGeneratorScheduler();
      this.registerHealthCheckScheduler();
      this.registerRefundProcessingScheduler();
      this.registerPromoExpirationScheduler();
      this.registerNotificationReminderScheduler();

      this.isInitialized = true;
      logger.info(`[Scheduler] ✅ All ${this.tasks.length} schedulers initialized`);
      this.logScheduleInfo();
    } catch (error) {
      logger.error('[Scheduler] Initialization failed:', error);
      throw error;
    }
  }

  registerRefundProcessingScheduler() {
    const { processRefundsJob } = require('./refund.job');
    const task = cron.schedule('0 * * * *', async () => {
      try {
        logger.info('[Scheduler] Starting refund processing...');
        await processRefundsJob();
        logger.info('[Scheduler] ✅ Refund processing completed');
      } catch (error) {
        logger.error('[Scheduler] Refund processing failed:', error);
      }
    });
    this.tasks.push({
      name: 'Refund Processing',
      schedule: 'Hourly',
      cron: '0 * * * *',
      task,
    });
  }

  registerPromoExpirationScheduler() {
    const { processPromoExpirationJob } = require('./promoExpiration.job');
    const task = cron.schedule('0 0 * * *', async () => {
      try {
        logger.info('[Scheduler] Starting promo/coupon expiration...');
        await processPromoExpirationJob();
        logger.info('[Scheduler] ✅ Promo/coupon expiration completed');
      } catch (error) {
        logger.error('[Scheduler] Promo/coupon expiration failed:', error);
      }
    });
    this.tasks.push({
      name: 'Promo/Coupon Expiration',
      schedule: 'Daily at midnight',
      cron: '0 0 * * *',
      task,
    });
  }

  registerNotificationReminderScheduler() {
    const { processNotificationRemindersJob } = require('./notificationReminder.job');
    const task = cron.schedule('0 * * * *', async () => {
      try {
        logger.info('[Scheduler] Starting notification reminders...');
        await processNotificationRemindersJob();
        logger.info('[Scheduler] ✅ Notification reminders sent');
      } catch (error) {
        logger.error('[Scheduler] Notification reminders failed:', error);
      }
    });
    this.tasks.push({
      name: 'Notification Reminders',
      schedule: 'Hourly',
      cron: '0 * * * *',
      task,
    });
  }
  
  registerInventorySyncScheduler() {
    const task = cron.schedule('0 */30 * * * *', async () => {
      try {
        logger.info('[Scheduler] Starting inventory sync...');
        await syncInventory();
        logger.info('[Scheduler] ✅ Inventory sync completed');
      } catch (error) {
        logger.error('[Scheduler] Inventory sync failed:', error);
      }
    });

    this.tasks.push({
      name: 'Inventory Sync',
      schedule: 'Every 30 minutes',
      cron: '0 */30 * * * *',
      task,
    });

    const alertTask = cron.schedule('0 0 */6 * * *', async () => {
      try {
        logger.info('[Scheduler] Checking low stock alerts...');
        await syncLowStockAlerts();
        logger.info('[Scheduler] ✅ Low stock check completed');
      } catch (error) {
        logger.error('[Scheduler] Low stock check failed:', error);
      }
    });

    this.tasks.push({
      name: 'Low Stock Alert',
      schedule: 'Every 6 hours',
      cron: '0 0 */6 * * *',
      task: alertTask,
    });
  }

  registerOrderProcessorScheduler() {
    const task = cron.schedule('0 */10 * * * *', async () => {
      try {
        logger.info('[Scheduler] Starting order processing...');
        await processOrders();
        logger.info('[Scheduler] ✅ Order processing completed');
      } catch (error) {
        logger.error('[Scheduler] Order processing failed:', error);
      }
    });

    this.tasks.push({
      name: 'Order Processor',
      schedule: 'Every 10 minutes',
      cron: '0 */10 * * * *',
      task,
    });

    const validateTask = cron.schedule('0 * * * *', async () => {
      try {
        logger.info('[Scheduler] Starting order validation...');
        await validateOrders();
        logger.info('[Scheduler] ✅ Order validation completed');
      } catch (error) {
        logger.error('[Scheduler] Order validation failed:', error);
      }
    });

    this.tasks.push({
      name: 'Order Validator',
      schedule: 'Hourly',
      cron: '0 * * * *',
      task: validateTask,
    });

    const cleanupTask = cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('[Scheduler] Starting order cleanup...');
        await cleanUpOrders();
        logger.info('[Scheduler] ✅ Order cleanup completed');
      } catch (error) {
        logger.error('[Scheduler] Order cleanup failed:', error);
      }
    });

    this.tasks.push({
      name: 'Order Cleanup',
      schedule: 'Daily at 2:00 AM',
      cron: '0 2 * * *',
      task: cleanupTask,
    });
  }

  registerPaymentSyncScheduler() {
    const syncTask = cron.schedule('0 */15 * * * *', async () => {
      try {
        logger.info('[Scheduler] Starting payment sync...');
        await syncPayments();
        logger.info('[Scheduler] ✅ Payment sync completed');
      } catch (error) {
        logger.error('[Scheduler] Payment sync failed:', error);
      }
    });

    this.tasks.push({
      name: 'Payment Sync',
      schedule: 'Every 15 minutes',
      cron: '0 */15 * * * *',
      task: syncTask,
    });

    const reconcileTask = cron.schedule('0 * * * *', async () => {
      try {
        logger.info('[Scheduler] Starting payment reconciliation...');
        await reconcilePayments();
        logger.info('[Scheduler] ✅ Payment reconciliation completed');
      } catch (error) {
        logger.error('[Scheduler] Payment reconciliation failed:', error);
      }
    });

    this.tasks.push({
      name: 'Payment Reconciliation',
      schedule: 'Hourly',
      cron: '0 * * * *',
      task: reconcileTask,
    });

    // Payment retry: Every 5 minutes
    const retryTask = cron.schedule('0 */5 * * * *', async () => {
      try {
        logger.info('[Scheduler] Starting payment retry...');
        await handleFailedPayments();
        logger.info('[Scheduler] ✅ Payment retry completed');
      } catch (error) {
        logger.error('[Scheduler] Payment retry failed:', error);
      }
    });

    this.tasks.push({
      name: 'Payment Retry',
      schedule: 'Every 5 minutes',
      cron: '0 */5 * * * *',
      task: retryTask,
    });
  }

 
  registerAnalyticsScheduler() {
    const updateTask = cron.schedule('0 */30 * * * *', async () => {
      try {
        logger.info('[Scheduler] Updating analytics...');
        await updateAnalytics();
        logger.info('[Scheduler] ✅ Analytics updated');
      } catch (error) {
        logger.error('[Scheduler] Analytics update failed:', error);
      }
    });

    this.tasks.push({
      name: 'Analytics Update',
      schedule: 'Every 30 minutes',
      cron: '0 */30 * * * *',
      task: updateTask,
    });

    // Analytics report generation: Every day at 6 AM
    const reportTask = cron.schedule('0 6 * * *', async () => {
      try {
        logger.info('[Scheduler] Generating analytics report...');
        await generateAnalyticsReport();
        logger.info('[Scheduler] ✅ Analytics report generated');
      } catch (error) {
        logger.error('[Scheduler] Analytics report generation failed:', error);
      }
    });

    this.tasks.push({
      name: 'Analytics Report',
      schedule: 'Daily at 6:00 AM',
      cron: '0 6 * * *',
      task: reportTask,
    });
  }

  /**
   * REPORT GENERATOR SCHEDULER
   * Generates daily sales report at 6 AM
   * Generates weekly report every Sunday at 6 AM
   * Cron: 0 6 * * * (daily), 0 6 * * 0 (weekly)
   */
  registerReportGeneratorScheduler() {
    const task = cron.schedule('0 6 * * *', async () => {
      try {
        logger.info('[Scheduler] Generating daily sales report...');
        await generateReport();
        logger.info('[Scheduler] ✅ Daily sales report generated');
      } catch (error) {
        logger.error('[Scheduler] Report generation failed:', error);
      }
    });

    this.tasks.push({
      name: 'Sales Report Generator',
      schedule: 'Daily at 6:00 AM',
      cron: '0 6 * * *',
      task,
    });

    // Weekly report: Every Sunday at 6 AM
    const weeklyTask = cron.schedule('0 6 * * 0', async () => {
      try {
        logger.info('[Scheduler] Generating weekly report...');
        await generateWeeklyReport();
        logger.info('[Scheduler] ✅ Weekly report generated');
      } catch (error) {
        logger.error('[Scheduler] Weekly report generation failed:', error);
      }
    });

    this.tasks.push({
      name: 'Weekly Report',
      schedule: 'Every Sunday at 6:00 AM',
      cron: '0 6 * * 0',
      task: weeklyTask,
    });
  }

  /**
   * HEALTH CHECK SCHEDULER
   * Logs active schedules every hour
   * Cron: 0 * * * *
   */
  registerHealthCheckScheduler() {
    const task = cron.schedule('0 * * * *', () => {
      logger.info(
        `[Scheduler] ✅ Health check: ${this.tasks.length} active schedulers`
      );
    });

    this.tasks.push({
      name: 'Health Check',
      schedule: 'Hourly',
      cron: '0 * * * *',
      task,
    });
  }

  /**,
   * STOP ALL SCHEDULERS
   */
  stopAll() {
    this.tasks.forEach((task) => {
      if (task.task) {
        task.task.stop();
      }
    });
    this.isInitialized = false;
    logger.info('[Scheduler] All schedulers stopped');
  }

  /**
   * GET SCHEDULER STATUS
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      totalSchedulers: this.tasks.length,
      schedulers: this.tasks.map((t) => ({
        name: t.name,
        schedule: t.schedule,
        cron: t.cron,
      })),
    };
  }

  /**
   * LOG SCHEDULE INFORMATION
   */
  logScheduleInfo() {
    logger.info('[Scheduler] ╔════════════════════════════════════════════╗');
    logger.info('[Scheduler] ║       SCHEDULER CONFIGURATION              ║');
    logger.info('[Scheduler] ╠════════════════════════════════════════════╣');

    this.tasks.forEach((task, index) => {
      const taskNum = String(index + 1).padStart(2, ' ');
      const name = task.name.padEnd(25);
      const schedule = task.schedule.padEnd(22);
      logger.info(
        `[Scheduler] ║ ${taskNum}. ${name} │ ${schedule} ║`
      );
    });

    logger.info('[Scheduler] ╚════════════════════════════════════════════╝');
  }
}

// Create singleton instance
const schedulerManager = new SchedulerManager();

module.exports = schedulerManager;
