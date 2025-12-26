const { catchAsync } = require('../../core/catchAsync');
const { sendSuccess, sendError } = require('../../core/response');
const { AnalyticsService } = require('./analytics.service');

/**
 * ANALYTICS CONTROLLER
 * Handles analytics HTTP requests (ADMIN ONLY)
 */

const AnalyticsController = {
  /**
   * GET DASHBOARD
   * GET /admin/analytics/dashboard
   */
  getDashboard: catchAsync(async (req, res) => {
    const dashboard = await AnalyticsService.getDashboard();
    sendSuccess(res, dashboard, 'Dashboard retrieved successfully', 200);
  }),

  /**
   * GET SALES ANALYTICS
   * GET /admin/analytics/sales
   */
  getSalesAnalytics: catchAsync(async (req, res) => {
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    if (!startDate || !endDate) {
      return sendError(
        res,
        'startDate and endDate query parameters are required',
        400
      );
    }

    AnalyticsService.validateDateRange(startDate, endDate);

    const analytics = await AnalyticsService.getSalesAnalytics(
      new Date(startDate),
      new Date(endDate),
      { page: parseInt(page), limit: parseInt(limit) }
    );

    sendSuccess(res, analytics, 'Sales analytics retrieved successfully', 200);
  }),

  /**
   * GET TRAFFIC ANALYTICS
   * GET /admin/analytics/traffic
   */
  getTrafficAnalytics: catchAsync(async (req, res) => {
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    if (!startDate || !endDate) {
      return sendError(
        res,
        'startDate and endDate query parameters are required',
        400
      );
    }

    AnalyticsService.validateDateRange(startDate, endDate);

    const analytics = await AnalyticsService.getTrafficAnalytics(
      new Date(startDate),
      new Date(endDate),
      { page: parseInt(page), limit: parseInt(limit) }
    );

    sendSuccess(
      res,
      analytics,
      'Traffic analytics retrieved successfully',
      200
    );
  }),

  /**
   * GET REVENUE ANALYTICS
   * GET /admin/analytics/revenue
   */
  getRevenueAnalytics: catchAsync(async (req, res) => {
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    if (!startDate || !endDate) {
      return sendError(
        res,
        'startDate and endDate query parameters are required',
        400
      );
    }

    AnalyticsService.validateDateRange(startDate, endDate);

    const analytics = await AnalyticsService.getRevenueAnalytics(
      new Date(startDate),
      new Date(endDate),
      { page: parseInt(page), limit: parseInt(limit) }
    );

    sendSuccess(
      res,
      analytics,
      'Revenue analytics retrieved successfully',
      200
    );
  }),

  /**
   * GET TOP PRODUCTS
   * GET /admin/analytics/top-products
   */
  getTopProducts: catchAsync(async (req, res) => {
    const { startDate, endDate, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return sendError(
        res,
        'startDate and endDate query parameters are required',
        400
      );
    }

    AnalyticsService.validateDateRange(startDate, endDate);

    const products = await AnalyticsService.getTopProducts(
      new Date(startDate),
      new Date(endDate),
      parseInt(limit)
    );

    sendSuccess(res, products, 'Top products retrieved successfully', 200);
  }),

  /**
   * GET SALES AGGREGATION
   * GET /admin/analytics/aggregation
   */
  getAggregation: catchAsync(async (req, res) => {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return sendError(
        res,
        'startDate and endDate query parameters are required',
        400
      );
    }

    AnalyticsService.validateDateRange(startDate, endDate);

    const aggregation = await AnalyticsService.getSalesAggregation(
      new Date(startDate),
      new Date(endDate),
      groupBy
    );

    sendSuccess(res, aggregation, 'Aggregation data retrieved successfully', 200);
  }),
};

module.exports = {
  AnalyticsController,
};
