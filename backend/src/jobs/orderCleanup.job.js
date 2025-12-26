// src/jobs/orderCleanup.job.js
const logger = require('../config/logger');
const Order = require('../modules/order/order.model');

/**
 * CLEAN UP ORDERS
 * Removes stale/cancelled orders older than 24 hours
 */
const cleanUpOrders = async () => {
  try {
    logger.info('[OrderCleanup] Starting order cleanup...');

    const HOURS = 24; // clean orders older than 24 hours
    const cutoffDate = new Date(Date.now() - HOURS * 60 * 60 * 1000);

    const result = await Order.deleteMany({
      status: { $in: ['pending', 'cancelled'] },
      createdAt: { $lt: cutoffDate },
    });

    logger.info(
      `[OrderCleanup] ✅ Cleanup completed: Deleted ${result.deletedCount} orders older than ${HOURS}h`
    );

    return { deletedCount: result.deletedCount };
  } catch (error) {
    logger.error('[OrderCleanup] Cleanup job failed:', error);
    throw error;
  }
};

/**
 * PROCESS ORDERS
 * Processes pending orders and updates their status
 * Moves pending → processing → shipped
 */
const processOrders = async () => {
  try {
    logger.info('[OrderProcessor] Starting order processing...');

    // Find pending orders
    const pendingOrders = await Order.find({ status: 'pending' }).limit(100);

    if (pendingOrders.length === 0) {
      logger.debug('[OrderProcessor] No pending orders to process');
      return { processed: 0, updated: 0, failed: 0 };
    }

    logger.info(
      `[OrderProcessor] Found ${pendingOrders.length} pending orders`
    );

    let processed = 0;
    let updated = 0;
    let failed = 0;

    for (const order of pendingOrders) {
      try {
        // Check if payment is confirmed
        const paymentConfirmed = order.paymentStatus === 'completed' ||
          order.paymentStatus === 'success';

        if (!paymentConfirmed) {
          // Skip if payment not confirmed
          continue;
        }

        // Check if we have inventory for all items
        const Product = require('../modules/products/product.model');
        let hasInventory = true;

        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          if (!product || product.stock < item.quantity) {
            hasInventory = false;
            logger.warn(
              `[OrderProcessor] Insufficient inventory for order ${order._id}`
            );
            break;
          }
        }

        if (!hasInventory) {
          continue;
        }

        // Move to processing
        order.status = 'processing';
        order.processedAt = new Date();
        await order.save();

        logger.debug(
          `[OrderProcessor] Order ${order._id} moved to processing`
        );
        updated++;
      } catch (error) {
        failed++;
        logger.error(
          `[OrderProcessor] Failed to process order ${order._id}: ${error.message}`
        );
      }

      processed++;
    }

    const result = { processed, updated, failed };
    logger.info(
      `[OrderProcessor] ✅ Processing completed: ` +
        `${updated} updated, ${failed} failed`
    );

    return result;
  } catch (error) {
    logger.error('[OrderProcessor] Processing job failed:', error);
    throw error;
  }
};

/**
 * VALIDATE ORDERS
 * Validates order integrity and payment status
 */
const validateOrders = async () => {
  try {
    logger.info('[OrderValidator] Validating orders...');

    const orders = await Order.find({
      status: { $in: ['pending', 'processing'] },
    }).limit(100);

    let validated = 0;
    let issues = 0;

    for (const order of orders) {
      try {
        // Check if order has items
        if (!order.items || order.items.length === 0) {
          logger.warn(
            `[OrderValidator] Order ${order._id} has no items`
          );
          issues++;
          continue;
        }

        // Check if total amount matches items sum
        const itemsTotal = order.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        if (Math.abs(itemsTotal - order.totalAmount) > 0.01) {
          logger.warn(
            `[OrderValidator] Order ${order._id} amount mismatch: ` +
              `Items=${itemsTotal}, Total=${order.totalAmount}`
          );
          issues++;
        }

        validated++;
      } catch (error) {
        logger.error(
          `[OrderValidator] Failed to validate order ${order._id}: ${error.message}`
        );
        issues++;
      }
    }

    logger.info(
      `[OrderValidator] ✅ Validation completed: ${validated} validated, ${issues} issues found`
    );

    return { validated, issues };
  } catch (error) {
    logger.error('[OrderValidator] Validation job failed:', error);
    throw error;
  }
};

module.exports = { cleanUpOrders, processOrders, validateOrders };

