const { AnalyticsDAO } = require('./analytics.dao');
const {
  salesAnalyticsDTO,
  trafficAnalyticsDTO,
  revenueAnalyticsDTO,
  dashboardDTO,
} = require('./analytics.dto');
const AppError = require('../../core/appError');

/**
 * ANALYTICS SERVICE
 * Business logic for analytics and reporting
 */

const AnalyticsService = {
  /**
   * GET DASHBOARD SUMMARY
   */
  async getDashboard() {
    const summary = await AnalyticsDAO.getTodaysSummary();
    return dashboardDTO(summary.sales, summary.traffic, summary.revenue);
  },

  /**
   * GET SALES ANALYTICS
   */
  async getSalesAnalytics(startDate, endDate, options = {}) {
    const analytics = await AnalyticsDAO.getSalesAnalytics(
      startDate,
      endDate,
      options
    );

    return {
      ...analytics,
      items: analytics.items.map(salesAnalyticsDTO),
    };
  },

  /**
   * GET TRAFFIC ANALYTICS
   */
  async getTrafficAnalytics(startDate, endDate, options = {}) {
    const analytics = await AnalyticsDAO.getTrafficAnalytics(
      startDate,
      endDate,
      options
    );

    return {
      ...analytics,
      items: analytics.items.map(trafficAnalyticsDTO),
    };
  },

  /**
   * GET REVENUE ANALYTICS
   */
  async getRevenueAnalytics(startDate, endDate, options = {}) {
    const analytics = await AnalyticsDAO.getRevenueAnalytics(
      startDate,
      endDate,
      options
    );

    return {
      ...analytics,
      items: analytics.items.map(revenueAnalyticsDTO),
    };
  },

  /**
   * GET TOP PRODUCTS
   */
  async getTopProducts(startDate, endDate, limit = 10) {
    const products = await AnalyticsDAO.getTopProducts(
      startDate,
      endDate,
      limit
    );
    return products;
  },

  /**
   * GET AGGREGATED SALES BY PERIOD
   */
  async getSalesAggregation(startDate, endDate, groupBy = 'day') {
    const data = await AnalyticsDAO.aggregateSalesByPeriod(
      startDate,
      endDate,
      groupBy
    );
    return data;
  },

  /**
   * VALIDATE DATE RANGE
   */
  validateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      throw new AppError('Invalid date format', 400);
    }

    if (start > end) {
      throw new AppError('Start date must be before end date', 400);
    }

    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      throw new AppError('Date range cannot exceed 365 days', 400);
    }

    return { start, end };
  },
};

module.exports = {
  AnalyticsService,
};
