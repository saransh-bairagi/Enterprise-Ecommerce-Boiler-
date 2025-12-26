// src/jobs/inventorySync.job.js
const logger = require('../config/logger');
const Product = require('../modules/products/product.model');

/**
 * SYNC INVENTORY
 * Syncs inventory from external sources or updates stock levels
 */
const syncInventory = async () => {
  try {
    logger.info('[InventorySync] Starting inventory sync...');

    // Fetch latest inventory from external system
    const externalInventory = [
      { productId: '64fa123abc', stock: 50 },
      { productId: '64fa123def', stock: 30 },
    ];

    let updated = 0;
    let notFound = 0;

    for (const item of externalInventory) {
      try {
        const product = await Product.findById(item.productId);
        if (product) {
          // Only log if stock changed significantly (>10%)
          const oldStock = product.stock;
          const percentChange = Math.abs((item.stock - oldStock) / oldStock) * 100;

          product.stock = item.stock;
          product.lastInventorySyncAt = new Date();

          // Mark as low stock if below threshold
          if (item.stock <= 10) {
            product.isLowStock = true;
          } else {
            product.isLowStock = false;
          }

          await product.save();

          if (percentChange > 10) {
            logger.info(
              `[InventorySync] Updated ${product.name}: ` +
                `${oldStock} → ${item.stock} units (${percentChange.toFixed(1)}%)`
            );
          }
          updated++;
        } else {
          logger.warn(
            `[InventorySync] Product ${item.productId} not found ❌`
          );
          notFound++;
        }
      } catch (error) {
        logger.error(
          `[InventorySync] Error updating product ${item.productId}: ${error.message}`
        );
      }
    }

    logger.info(
      `[InventorySync] ✅ Sync completed: ${updated} updated, ${notFound} not found`
    );

    return { updated, notFound, total: externalInventory.length };
  } catch (error) {
    logger.error('[InventorySync] Sync job failed:', error);
    throw error;
  }
};

/**
 * SYNC LOW STOCK ALERTS
 * Identifies and alerts on low stock products
 */
const syncLowStockAlerts = async () => {
  try {
    logger.info('[InventorySync] Checking low stock alerts...');

    const lowStockProducts = await Product.find({ stock: { $lte: 10 } });

    if (lowStockProducts.length === 0) {
      logger.info('[InventorySync] No low stock products');
      return { alerts: 0 };
    }


    // Send email/notification to admin
    try {
      const { sendEmail } = require('../utils/email');
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const subject = `[ALERT] Low Stock Products (${lowStockProducts.length})`;
      const body = `The following products have low stock:\n\n` +
        lowStockProducts.map(p => `- ${p.name} (Stock: ${p.stock})`).join('\n');
      await sendEmail({ to: adminEmail, subject, text: body });
    } catch (notifyErr) {
      logger.error('[InventorySync] Failed to send low stock notification:', notifyErr);
    }
    logger.warn(
      `[InventorySync] ⚠️ ${lowStockProducts.length} products have low stock`
    );

    return {
      alerts: lowStockProducts.length,
      products: lowStockProducts.map((p) => ({ id: p._id, name: p.name, stock: p.stock })),
    };
  } catch (error) {
    logger.error('[InventorySync] Low stock check failed:', error);
    throw error;
  }
};

module.exports = { syncInventory, syncLowStockAlerts };

