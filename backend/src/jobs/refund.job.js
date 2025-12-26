// backend/src/jobs/refund.job.js
const logger = require('../config/logger');
const { processPendingRefunds } = require('../modules/payment/refund');

/**
 * Refund Processing Job
 * Processes pending refunds every hour
 */
async function processRefundsJob() {
  try {
    logger.info('[RefundJob] Processing pending refunds...');
    const result = await processPendingRefunds();
    logger.info(`[RefundJob] ✅ Processed refunds: ${result.count || 0}`);
    return result;
  } catch (error) {
    logger.error('[RefundJob] Refund processing failed:', error);
    throw error;
  }
}

module.exports = { processRefundsJob };
