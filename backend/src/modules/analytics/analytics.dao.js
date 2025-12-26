const {
  SalesAnalytics,
  TrafficAnalytics,
  RevenueAnalytics,
} = require('./analytics.model');

/**
 * ANALYTICS DAO
 * Handles all analytics queries and aggregations
 */

const AnalyticsDAO = {
  /**
   * GET SALES ANALYTICS FOR DATE RANGE
   */
  async getSalesAnalytics(startDate, endDate, options = {}) {
    const { page = 1, limit = 30 } = options;
    const skip = (page - 1) * limit;

    const filter = {
      date: { $gte: startDate, $lte: endDate },
      isDeleted: false,
    };

    const total = await SalesAnalytics.countDocuments(filter);

    const items = await SalesAnalytics.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * GET TRAFFIC ANALYTICS FOR DATE RANGE
   */
  async getTrafficAnalytics(startDate, endDate, options = {}) {
    const { page = 1, limit = 30 } = options;
    const skip = (page - 1) * limit;

    const filter = {
      date: { $gte: startDate, $lte: endDate },
      isDeleted: false,
    };

    const total = await TrafficAnalytics.countDocuments(filter);

    const items = await TrafficAnalytics.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * GET REVENUE ANALYTICS FOR DATE RANGE
   */
  async getRevenueAnalytics(startDate, endDate, options = {}) {
    const { page = 1, limit = 30 } = options;
    const skip = (page - 1) * limit;

    const filter = {
      date: { $gte: startDate, $lte: endDate },
      isDeleted: false,
    };

    const total = await RevenueAnalytics.countDocuments(filter);

    const items = await RevenueAnalytics.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * GET TODAY'S SUMMARY
   */
  async getTodaysSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sales = await SalesAnalytics.findOne({
      date: { $gte: today, $lt: tomorrow },
      isDeleted: false,
    }).lean();

    const traffic = await TrafficAnalytics.findOne({
      date: { $gte: today, $lt: tomorrow },
      isDeleted: false,
    }).lean();

    const revenue = await RevenueAnalytics.findOne({
      date: { $gte: today, $lt: tomorrow },
      isDeleted: false,
    }).lean();

    return { sales, traffic, revenue };
  },

  /**
   * AGGREGATE SALES BY TIME PERIOD
   */
  async aggregateSalesByPeriod(startDate, endDate, groupBy = 'day') {
    let dateFormat = '%Y-%m-%d'; // default: day

    if (groupBy === 'week') {
      dateFormat = '%Y-%U'; // week
    } else if (groupBy === 'month') {
      dateFormat = '%Y-%m'; // month
    }

    return SalesAnalytics.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$date' } },
          totalOrders: { $sum: '$totalOrders' },
          totalRevenue: { $sum: '$totalRevenue' },
          totalDiscount: { $sum: '$totalDiscount' },
          avgOrderValue: { $avg: '$averageOrderValue' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  /**
   * GET TOP PERFORMING PRODUCTS
   */
  async getTopProducts(startDate, endDate, limit = 10) {
    const results = await SalesAnalytics.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          isDeleted: false,
        },
      },
      {
        $unwind: '$topProducts',
      },
      {
        $group: {
          _id: '$topProducts.productId',
          name: { $first: '$topProducts.name' },
          totalQuantity: { $sum: '$topProducts.quantity' },
          totalRevenue: { $sum: '$topProducts.revenue' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
    ]);

    return results;
  },

  /**
   * RECORD ANALYTICS DATA
   */
  async recordSalesAnalytics(data) {
    const record = new SalesAnalytics(data);
    return record.save();
  },

  async recordTrafficAnalytics(data) {
    const record = new TrafficAnalytics(data);
    return record.save();
  },

  async recordRevenueAnalytics(data) {
    const record = new RevenueAnalytics(data);
    return record.save();
  },
};

module.exports = {
  AnalyticsDAO,
};
