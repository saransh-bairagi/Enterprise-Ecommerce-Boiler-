/**
 * ANALYTICS JOB
 * Generates analytics reports and updates metrics
 * Tracks sales, orders, inventory, and user behavior
 */

const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');
const Order = require('../modules/order/order.model');
const Analytics = require('../modules/analytics/analytics.model');
const Transaction = require('../modules/payment/payment.model');
const Product = require('../modules/products/product.model');
const User = require('../modules/user/user.model');

/**
 * UPDATE ANALYTICS
 * Calculates and updates real-time analytics metrics
 */
const updateAnalytics = async () => {
  try {
    logger.info('[Analytics] Starting analytics update...');

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    // ═════════════════════════════════════════════════════════════════════════════
    // DAILY METRICS
    // ═════════════════════════════════════════════════════════════════════════════
    const dailyOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    const dailySales = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          capturedAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const dailyRevenue = dailySales[0]?.totalAmount || 0;
    const dailyOrderCount = dailySales[0]?.count || 0;

    // New users today
    const dailyNewUsers = await User.countDocuments({
      createdAt: { $gte: today },
    });

    // Average order value (today)
    const dailyAOV =
      dailyOrderCount > 0 ? dailyRevenue / dailyOrderCount : 0;

    logger.debug(
      `[Analytics] Daily: Orders=${dailyOrders}, Revenue=${dailyRevenue}, AOV=${dailyAOV}`
    );

    // ═════════════════════════════════════════════════════════════════════════════
    // MONTHLY METRICS
    // ═════════════════════════════════════════════════════════════════════════════
    const monthlySales = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          capturedAt: { $gte: thisMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyRevenue = monthlySales[0]?.totalAmount || 0;
    const monthlyOrderCount = monthlySales[0]?.count || 0;
    const monthlyAOV =
      monthlyOrderCount > 0 ? monthlyRevenue / monthlyOrderCount : 0;

    const monthlyNewUsers = await User.countDocuments({
      createdAt: { $gte: thisMonth },
    });

    logger.debug(
      `[Analytics] Monthly: Orders=${monthlyOrderCount}, Revenue=${monthlyRevenue}, AOV=${monthlyAOV}`
    );

    // ═════════════════════════════════════════════════════════════════════════════
    // YEARLY METRICS
    // ═════════════════════════════════════════════════════════════════════════════
    const yearlySales = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          capturedAt: { $gte: thisYear },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const yearlyRevenue = yearlySales[0]?.totalAmount || 0;
    const yearlyOrderCount = yearlySales[0]?.count || 0;
    const yearlyAOV =
      yearlyOrderCount > 0 ? yearlyRevenue / yearlyOrderCount : 0;

    const yearlyNewUsers = await User.countDocuments({
      createdAt: { $gte: thisYear },
    });

    logger.debug(
      `[Analytics] Yearly: Orders=${yearlyOrderCount}, Revenue=${yearlyRevenue}, AOV=${yearlyAOV}`
    );

    // ═════════════════════════════════════════════════════════════════════════════
    // PRODUCT METRICS
    // ═════════════════════════════════════════════════════════════════════════════
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          quantity: { $sum: '$items.quantity' },
          revenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Low stock products
    const lowStockProducts = await Product.find({
      stock: { $lte: 10 },
    }).select('_id name stock');

    logger.debug(
      `[Analytics] Products: Top=${topProducts.length}, Low Stock=${lowStockProducts.length}`
    );

    // ═════════════════════════════════════════════════════════════════════════════
    // ORDER METRICS
    // ═════════════════════════════════════════════════════════════════════════════
    const orderStatusBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const orderMetrics = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    };

    orderStatusBreakdown.forEach((item) => {
      if (orderMetrics.hasOwnProperty(item._id)) {
        orderMetrics[item._id] = item.count;
      }
    });

    logger.debug(`[Analytics] Order Status: ${JSON.stringify(orderMetrics)}`);

    // ═════════════════════════════════════════════════════════════════════════════
    // SAVE ANALYTICS RECORD
    // ═════════════════════════════════════════════════════════════════════════════
    const analyticsRecord = new Analytics({
      date: new Date(),
      period: 'daily',
      metrics: {
        daily: {
          orders: dailyOrders,
          revenue: dailyRevenue,
          aov: dailyAOV,
          newUsers: dailyNewUsers,
          orderCount: dailyOrderCount,
        },
        monthly: {
          revenue: monthlyRevenue,
          aov: monthlyAOV,
          newUsers: monthlyNewUsers,
          orderCount: monthlyOrderCount,
        },
        yearly: {
          revenue: yearlyRevenue,
          aov: yearlyAOV,
          newUsers: yearlyNewUsers,
          orderCount: yearlyOrderCount,
        },
      },
      topProducts,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
      })),
      orderMetrics,
      timestamp: new Date(),
    });

    await analyticsRecord.save();

    logger.info(
      '[Analytics] ✅ Analytics updated: Daily Revenue=' +
        dailyRevenue +
        ', Monthly Revenue=' +
        monthlyRevenue
    );

    return {
      daily: { orders: dailyOrders, revenue: dailyRevenue },
      monthly: { orders: monthlyOrderCount, revenue: monthlyRevenue },
      yearly: { orders: yearlyOrderCount, revenue: yearlyRevenue },
    };
  } catch (error) {
    logger.error('[Analytics] Update failed:', error);
    throw error;
  }
};

/**
 * GENERATE ANALYTICS REPORT
 * Creates comprehensive analytics report
 */
const generateAnalyticsReport = async () => {
  try {
    logger.info('[Analytics] Generating analytics report...');

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Fetch latest analytics record
    const analytics = await Analytics.findOne().sort({ timestamp: -1 });

    if (!analytics) {
      logger.warn('[Analytics] No analytics data available for report');
      return { generated: false };
    }

    // Generate report content
    const report = {
      generatedAt: new Date(),
      reportDate: dateStr,
      summary: {
        dailyRevenue: analytics.metrics.daily.revenue,
        dailyOrders: analytics.metrics.daily.orders,
        dailyAOV: analytics.metrics.daily.aov,
        monthlyRevenue: analytics.metrics.monthly.revenue,
        monthlyOrders: analytics.metrics.monthly.orderCount,
        yearlyRevenue: analytics.metrics.yearly.revenue,
      },
      details: {
        topProducts: analytics.topProducts.slice(0, 10),
        lowStockProducts: analytics.lowStockProducts,
        orderMetrics: analytics.orderMetrics,
      },
    };

    // Save report to file
    const reportDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const fileName = `analytics-report-${dateStr}.json`;
    const filePath = path.join(reportDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

    logger.info(`[Analytics] ✅ Report generated: ${fileName}`);

    return { generated: true, fileName };
  } catch (error) {
    logger.error('[Analytics] Report generation failed:', error);
    throw error;
  }
};

/**
 * GENERATE DASHBOARD METRICS
 * Returns current metrics for dashboard display
 */
const getDashboardMetrics = async () => {
  try {
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    // Get latest analytics
    const latestAnalytics = await Analytics.findOne().sort({ timestamp: -1 });

    // Current active users (logged in last 30 minutes)
    const activeUsers = await User.countDocuments({
      lastActiveAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
    });

    // Pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Failed payments (today)
    const failedPayments = await Transaction.countDocuments({
      status: 'failed',
      createdAt: { $gte: today },
    });

    // Refunds (today)
    const refunds = await Transaction.countDocuments({
      'refunds.0': { $exists: true },
      createdAt: { $gte: today },
    });

    return {
      daily: latestAnalytics?.metrics.daily || {},
      monthly: latestAnalytics?.metrics.monthly || {},
      activeUsers,
      pendingOrders,
      failedPayments,
      refunds,
      lastUpdated: latestAnalytics?.timestamp,
    };
  } catch (error) {
    logger.error('[Analytics] Failed to get dashboard metrics:', error);
    throw error;
  }
};

module.exports = {
  updateAnalytics,
  generateAnalyticsReport,
  getDashboardMetrics,
};
