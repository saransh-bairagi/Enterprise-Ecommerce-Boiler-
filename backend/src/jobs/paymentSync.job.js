/**
 * PAYMENT SYNC JOB
 * Syncs payments from Razorpay and other payment gateways
 * Handles payment reconciliation and status updates
 */

const logger = require('../config/logger');
const Transaction = require('../modules/payment/payment.model');
const RazorpayService = require('../utils/razorpay');
const AppError = require('../core/appError');

/**
 * SYNC PAYMENTS
 * Fetches pending payments from Razorpay and updates local database
 */
const syncPayments = async () => {
  try {
    logger.info('[PaymentSync] Starting payment synchronization...');

    // Find all pending transactions
    const pendingTransactions = await Transaction.find({
      status: 'pending',
      provider: 'razorpay',
    }).limit(100);

    if (pendingTransactions.length === 0) {
      logger.info('[PaymentSync] No pending payments to sync');
      return { synced: 0, updated: 0, failed: 0 };
    }

    logger.info(
      `[PaymentSync] Found ${pendingTransactions.length} pending payments`
    );

    let synced = 0;
    let updated = 0;
    let failed = 0;

    for (const transaction of pendingTransactions) {
      try {
        // Fetch latest payment details from Razorpay
        const paymentDetails = await RazorpayService.getPaymentDetails(
          transaction.providerTransactionId
        );

        logger.debug(`[PaymentSync] Fetching payment ${paymentDetails.id}`);

        // Map Razorpay status to our status
        const statusMap = {
          captured: 'success',
          authorized: 'processing',
          failed: 'failed',
          created: 'pending',
        };

        const newStatus = statusMap[paymentDetails.status] || 'pending';

        // If status changed, update transaction
        if (newStatus !== transaction.status) {
          const oldStatus = transaction.status;
          transaction.status = newStatus;
          transaction.gatewayResponse = paymentDetails;
          transaction.lastSyncedAt = new Date();

          if (newStatus === 'success') {
            transaction.capturedAt = new Date();
          } else if (newStatus === 'failed') {
            transaction.failedAt = new Date();
          }

          await transaction.save();
          updated++;
          logger.debug(
            `[PaymentSync] Updated payment ${transaction._id} to ${newStatus}`
          );
          // --- AUDIT LOG ---
          logger.info(
            `[AUDIT] Payment status changed: { id: ${transaction._id}, oldStatus: ${oldStatus}, newStatus: ${newStatus}, syncedAt: ${transaction.lastSyncedAt.toISOString()} }`
          );
        }

        synced++;
      } catch (error) {
        failed++;
        logger.error(
          `[PaymentSync] Failed to sync payment ${transaction._id}: ${error.message}`
        );
      }
    }

    const result = { synced, updated, failed };
    logger.info(
      `[PaymentSync] ✅ Sync completed: ${synced} checked, ${updated} updated, ${failed} failed`
    );

    return result;
  } catch (error) {
    logger.error('[PaymentSync] Sync job failed:', error);
    throw error;
  }
};

/**
 * RECONCILE PAYMENTS
 * Compares local payment records with Razorpay records
 * Identifies and flags discrepancies
 */
const reconcilePayments = async () => {
  try {
    logger.info('[PaymentReconcile] Starting payment reconciliation...');

    // Find all captured payments from last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const capturedPayments = await Transaction.find({
      status: 'success',
      provider: 'razorpay',
      capturedAt: { $gte: oneHourAgo },
    }).limit(100);

    if (capturedPayments.length === 0) {
      logger.info('[PaymentReconcile] No payments to reconcile');
      return { checked: 0, reconciled: 0, discrepancies: 0 };
    }

    logger.info(
      `[PaymentReconcile] Checking ${capturedPayments.length} captured payments`
    );

    let reconciled = 0;
    let discrepancies = 0;

    for (const payment of capturedPayments) {
      try {
        const razorpayPayment = await RazorpayService.getPaymentDetails(
          payment.providerTransactionId
        );

        // Check for amount mismatch
        if (razorpayPayment.amount !== payment.amount * 100) {
          logger.warn(
            `[PaymentReconcile] Amount mismatch for payment ${payment._id}:` +
              ` Local=${payment.amount}, Razorpay=${razorpayPayment.amount / 100}`
          );
          discrepancies++;

          // Flag payment for manual review
          payment.flaggedForReview = true;
          payment.flagReason = 'Amount mismatch with gateway';
          await payment.save();
          // --- AUDIT LOG ---
          logger.info(
            `[AUDIT] Payment flagged for review: { id: ${payment._id}, reason: 'Amount mismatch', localAmount: ${payment.amount}, gatewayAmount: ${razorpayPayment.amount / 100} }`
          );
          continue;
        }

        // Check for status mismatch
        if (
          razorpayPayment.status === 'captured' &&
          payment.status !== 'success'
        ) {
          logger.warn(
            `[PaymentReconcile] Status mismatch for payment ${payment._id}:` +
              ` Local=${payment.status}, Razorpay=captured`
          );
          const oldStatus = payment.status;
          payment.status = 'success';
          await payment.save();
          discrepancies++;
          // --- AUDIT LOG ---
          logger.info(
            `[AUDIT] Payment status reconciled: { id: ${payment._id}, oldStatus: ${oldStatus}, newStatus: 'success', reconciledAt: ${new Date().toISOString()} }`
          );
        }

        reconciled++;
      } catch (error) {
        logger.error(
          `[PaymentReconcile] Failed to reconcile payment ${payment._id}: ${error.message}`
        );
        discrepancies++;
      }
    }

    const result = {
      checked: capturedPayments.length,
      reconciled,
      discrepancies,
    };
    logger.info(
      `[PaymentReconcile] ✅ Reconciliation completed: ` +
        `${reconciled} verified, ${discrepancies} discrepancies`
    );

    return result;
  } catch (error) {
    logger.error('[PaymentReconcile] Reconciliation job failed:', error);
    throw error;
  }
};

/**
 * HANDLE FAILED PAYMENTS
 * Retries failed payments based on retry policy
 */
const handleFailedPayments = async () => {
  try {
    logger.info('[PaymentRetry] Starting failed payment retry...');

    // Find failed payments that can be retried
    const failedPayments = await Transaction.find({
      status: 'failed',
      provider: 'razorpay',
      retryCount: { $lt: 3 }, // Max 3 retries
      nextRetryAt: { $lte: new Date() },
    }).limit(50);

    if (failedPayments.length === 0) {
      logger.info('[PaymentRetry] No payments to retry');
      return { retried: 0, success: 0, failed: 0 };
    }

    logger.info(
      `[PaymentRetry] Retrying ${failedPayments.length} failed payments`
    );

    let retried = 0;
    let success = 0;
    let failed = 0;

    for (const payment of failedPayments) {
      try {
        // Check current status in Razorpay
        const razorpayPayment = await RazorpayService.getPaymentDetails(
          payment.providerTransactionId
        );

        if (razorpayPayment.status === 'captured') {
          // Payment actually succeeded, update local record
          payment.status = 'success';
          payment.capturedAt = new Date();
          await payment.save();
          success++;
        } else if (razorpayPayment.status === 'failed') {
          // Still failed, increment retry counter
          payment.retryCount = (payment.retryCount || 0) + 1;
          payment.nextRetryAt = new Date(
            Date.now() + Math.pow(2, payment.retryCount) * 60 * 1000
          ); // Exponential backoff
          await payment.save();
          retried++;
        }
      } catch (error) {
        logger.error(
          `[PaymentRetry] Failed to retry payment ${payment._id}: ${error.message}`
        );
        failed++;
      }
    }

    const result = { retried, success, failed };
    logger.info(
      `[PaymentRetry] ✅ Retry completed: ${retried} retried, ${success} successful, ${failed} failed`
    );

    return result;
  } catch (error) {
    logger.error('[PaymentRetry] Retry job failed:', error);
    throw error;
  }
};

module.exports = {
  syncPayments,
  reconcilePayments,
  handleFailedPayments,
};
