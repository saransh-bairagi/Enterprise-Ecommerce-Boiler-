const router = require('express').Router();

const { AnalyticsController } = require('./analytics.controller');

const { auth } = require('../../common middlewares/auth');
const { rbac } = require('../../common middlewares/rbac');
const {
  validateDateRangeQuery,
  validateTopProductsQuery,
  validateAggregationQuery,
} = require('./analytics.middleware');

// All analytics endpoints are ADMIN ONLY

/**
 * GET DASHBOARD
 * GET /admin/analytics/dashboard
 */
router.get(
  '/admin/dashboard',
  auth,
  rbac('admin'),
  AnalyticsController.getDashboard
);

/**
 * GET SALES ANALYTICS
 * GET /admin/analytics/sales?startDate=&endDate=
 */
router.get(
  '/admin/sales',
  auth,
  rbac('admin'),
  validateDateRangeQuery,
  AnalyticsController.getSalesAnalytics
);

/**
 * GET TRAFFIC ANALYTICS
 * GET /admin/analytics/traffic?startDate=&endDate=
 */
router.get(
  '/admin/traffic',
  auth,
  rbac('admin'),
  validateDateRangeQuery,
  AnalyticsController.getTrafficAnalytics
);

/**
 * GET REVENUE ANALYTICS
 * GET /admin/analytics/revenue?startDate=&endDate=
 */
router.get(
  '/admin/revenue',
  auth,
  rbac('admin'),
  validateDateRangeQuery,
  AnalyticsController.getRevenueAnalytics
);

/**
 * GET TOP PRODUCTS
 * GET /admin/analytics/top-products?startDate=&endDate=&limit=10
 */
router.get(
  '/admin/top-products',
  auth,
  rbac('admin'),
  validateTopProductsQuery,
  AnalyticsController.getTopProducts
);

/**
 * GET AGGREGATION
 * GET /admin/analytics/aggregation?startDate=&endDate=&groupBy=day|week|month
 */
router.get(
  '/admin/aggregation',
  auth,
  rbac('admin'),
  validateAggregationQuery,
  AnalyticsController.getAggregation
);

module.exports = router;
