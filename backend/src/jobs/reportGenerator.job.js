// src/jobs/reportGenerator.job.js
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');
const Order = require('../modules/order/order.model');
const Transaction = require('../modules/payment/payment.model');
const User = require('../modules/user/user.model');

/**
 * GENERATE REPORT
 * Generates daily sales report with order and revenue data
 */
const generateReport = async () => {
  try {
    logger.info('[ReportGenerator] Generating daily sales report...');

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Fetch today's orders
    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } })
      .populate('userId', 'email name')
      .lean();

    // Fetch today's successful payments
    const payments = await Transaction.find({
      status: 'success',
      capturedAt: { $gte: start, $lte: end },
    }).lean();

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalItems = orders.reduce(
      (sum, o) => sum + (o.items ? o.items.length : 0),
      0
    );

    // Order breakdown by status
    const statusBreakdown = {};
    orders.forEach((order) => {
      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
    });

    // Top products
    const topProducts = {};
    orders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item) => {
          topProducts[item.productId] =
            (topProducts[item.productId] || 0) + item.quantity;
        });
      }
    });

    const sortedTopProducts = Object.entries(topProducts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([productId, quantity]) => ({ productId, quantity }));

    // Build report
    const report = {
      generatedAt: new Date().toISOString(),
      reportDate: start.toISOString().split('T')[0],
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        totalItems,
        totalPayments: payments.length,
      },
      breakdown: {
        byStatus: statusBreakdown,
        topProducts: sortedTopProducts,
      },
      details: {
        orders: orders.map((o) => ({
          orderId: o._id,
          customer: o.userId?.email || 'Unknown',
          totalAmount: o.totalAmount,
          itemCount: o.items ? o.items.length : 0,
          status: o.status,
          createdAt: o.createdAt,
        })),
      },
    };

    // Save to file system
    const reportPath = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const fileName = `sales-report-${start.toISOString().split('T')[0]}.json`;
    const filePath = path.join(reportPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

    logger.info(
      `[ReportGenerator] ✅ Report generated: ${fileName} ` +
        `(Orders=${totalOrders}, Revenue=${totalRevenue}, AOV=${averageOrderValue.toFixed(2)})`
    );

    return {
      fileName,
      summary: report.summary,
    };
  } catch (error) {
    logger.error('[ReportGenerator] Report generation failed:', error);
    throw error;
  }
};

/**
 * GENERATE WEEKLY REPORT
 * Generates comprehensive weekly business report
 */
const generateWeeklyReport = async () => {
  try {
    logger.info('[ReportGenerator] Generating weekly report...');

    const today = new Date();
    const startOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay()
    );

    const orders = await Order.find({
      createdAt: { $gte: startOfWeek },
    }).lean();

    const payments = await Transaction.find({
      status: 'success',
      capturedAt: { $gte: startOfWeek },
    }).lean();

    const newUsers = await User.countDocuments({
      createdAt: { $gte: startOfWeek },
    });

    const weeklyRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const weeklyOrders = orders.length;

    const report = {
      generatedAt: new Date().toISOString(),
      period: `Week of ${startOfWeek.toISOString().split('T')[0]}`,
      metrics: {
        totalOrders: weeklyOrders,
        totalRevenue: weeklyRevenue,
        averageOrderValue: weeklyOrders > 0 ? weeklyRevenue / weeklyOrders : 0,
        newUsers,
        ordersPerDay: (weeklyOrders / 7).toFixed(2),
      },
    };

    const reportPath = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const fileName = `weekly-report-${startOfWeek.toISOString().split('T')[0]}.json`;
    const filePath = path.join(reportPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

    logger.info(
      `[ReportGenerator] ✅ Weekly report generated: ${fileName}`
    );

    return { fileName, metrics: report.metrics };
  } catch (error) {
    logger.error('[ReportGenerator] Weekly report generation failed:', error);
    throw error;
  }
};

module.exports = { generateReport, generateWeeklyReport };
