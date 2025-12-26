/**
 * ANALYTICS DTO
 * Data Transfer Objects for analytics responses
 */

const salesAnalyticsDTO = (data) => {
  if (!data) return null;

  return {
    id: data.publicId,
    date: data.date,
    totalOrders: data.totalOrders,
    totalRevenue: data.totalRevenue,
    totalDiscount: data.totalDiscount,
    averageOrderValue: data.averageOrderValue,
    totalItems: data.totalItems,
    topProducts: data.topProducts || [],
    topCategories: data.topCategories || [],
    paymentMethods: data.paymentMethods || {},
    createdAt: data.createdAt,
  };
};

const trafficAnalyticsDTO = (data) => {
  if (!data) return null;

  return {
    id: data.publicId,
    date: data.date,
    pageViews: data.pageViews,
    uniqueVisitors: data.uniqueVisitors,
    bounceRate: data.bounceRate,
    avgSessionDuration: data.avgSessionDuration,
    topPages: data.topPages || [],
    trafficSource: data.trafficSource || {},
    deviceType: data.deviceType || {},
    createdAt: data.createdAt,
  };
};

const revenueAnalyticsDTO = (data) => {
  if (!data) return null;

  return {
    id: data.publicId,
    date: data.date,
    grossRevenue: data.grossRevenue,
    netRevenue: data.netRevenue,
    costs: data.costs,
    profit: data.profit,
    roi: data.roi,
    taxCollected: data.taxCollected,
    refunds: data.refunds,
    createdAt: data.createdAt,
  };
};

const dashboardDTO = (sales, traffic, revenue) => {
  return {
    sales: salesAnalyticsDTO(sales),
    traffic: trafficAnalyticsDTO(traffic),
    revenue: revenueAnalyticsDTO(revenue),
    generatedAt: new Date(),
  };
};

module.exports = {
  salesAnalyticsDTO,
  trafficAnalyticsDTO,
  revenueAnalyticsDTO,
  dashboardDTO,
};
