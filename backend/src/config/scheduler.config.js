/**
 * SCHEDULER CONFIGURATION
 * Defines cron schedules and job configurations
 */

module.exports = {
  // ═════════════════════════════════════════════════════════════════════════════
  // SCHEDULER CONFIGURATION
  // ═════════════════════════════════════════════════════════════════════════════

  enabled: process.env.SCHEDULER_ENABLED !== 'false',
  timezone: process.env.SCHEDULER_TIMEZONE || 'Asia/Kolkata',

  // ═════════════════════════════════════════════════════════════════════════════
  // INVENTORY SYNC
  // ═════════════════════════════════════════════════════════════════════════════
  inventory: {
    sync: {
      enabled: true,
      schedule: '0 */30 * * * *', // Every 30 minutes
      description: 'Sync inventory from external sources',
    },
    lowStockAlert: {
      enabled: true,
      schedule: '0 */6 * * * *', // Every 6 hours
      description: 'Check for low stock products',
      threshold: 10, // Alert if stock <= 10
    },
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // ORDER PROCESSING
  // ═════════════════════════════════════════════════════════════════════════════
  orders: {
    process: {
      enabled: true,
      schedule: '0 */10 * * * *', // Every 10 minutes
      description: 'Process pending orders',
    },
    cleanup: {
      enabled: true,
      schedule: '0 2 * * *', // Every day at 2 AM
      description: 'Clean up cancelled/pending orders older than 24 hours',
      retentionHours: 24,
    },
    validate: {
      enabled: true,
      schedule: '0 * * * *', // Every hour
      description: 'Validate order integrity',
    },
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // PAYMENT PROCESSING
  // ═════════════════════════════════════════════════════════════════════════════
  payments: {
    sync: {
      enabled: true,
      schedule: '0 */15 * * * *', // Every 15 minutes
      description: 'Sync payment status from gateways',
      batchSize: 100,
    },
    reconcile: {
      enabled: true,
      schedule: '0 * * * *', // Every hour
      description: 'Reconcile payments with gateway records',
      lookbackHours: 1,
    },
    retry: {
      enabled: true,
      schedule: '0 */5 * * * *', // Every 5 minutes
      description: 'Retry failed payments',
      maxRetries: 3,
      backoffMultiplier: 2, // Exponential backoff
    },
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // ANALYTICS
  // ═════════════════════════════════════════════════════════════════════════════
  analytics: {
    update: {
      enabled: true,
      schedule: '0 */30 * * * *', // Every 30 minutes
      description: 'Update real-time analytics',
    },
    report: {
      enabled: true,
      schedule: '0 6 * * *', // Every day at 6 AM
      description: 'Generate daily analytics report',
    },
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // REPORTING
  // ═════════════════════════════════════════════════════════════════════════════
  reports: {
    daily: {
      enabled: true,
      schedule: '0 6 * * *', // Every day at 6 AM
      description: 'Generate daily sales report',
    },
    weekly: {
      enabled: true,
      schedule: '0 6 * * 0', // Every Sunday at 6 AM
      description: 'Generate weekly business report',
    },
},
};

 