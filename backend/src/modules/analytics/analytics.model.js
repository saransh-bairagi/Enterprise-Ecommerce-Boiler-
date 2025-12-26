const mongoose = require('mongoose');

// ----------------------------------------------------------
// SALES ANALYTICS SCHEMA
// ----------------------------------------------------------

const salesAnalyticsSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    averageOrderValue: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    topProducts: [
      {
        productId: String,
        name: String,
        quantity: Number,
        revenue: Number,
      },
    ],
    topCategories: [
      {
        categoryId: String,
        name: String,
        quantity: Number,
        revenue: Number,
      },
    ],
    paymentMethods: {
      creditCard: { count: Number, amount: Number },
      debitCard: { count: Number, amount: Number },
      netbanking: { count: Number, amount: Number },
      upi: { count: Number, amount: Number },
      wallet: { count: Number, amount: Number },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------------
// TRAFFIC ANALYTICS SCHEMA
// ----------------------------------------------------------

const trafficAnalyticsSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    pageViews: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    bounceRate: {
      type: Number,
      default: 0,
    },
    avgSessionDuration: {
      type: Number,
      default: 0,
    },
    topPages: [
      {
        path: String,
        views: Number,
        conversions: Number,
        conversionRate: Number,
      },
    ],
    trafficSource: {
      direct: Number,
      organic: Number,
      referral: Number,
      social: Number,
      paid: Number,
    },
    deviceType: {
      desktop: Number,
      mobile: Number,
      tablet: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------------
// REVENUE ANALYTICS SCHEMA
// ----------------------------------------------------------

const revenueAnalyticsSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    grossRevenue: {
      type: Number,
      default: 0,
    },
    netRevenue: {
      type: Number,
      default: 0,
    },
    costs: {
      type: Number,
      default: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
    roi: {
      type: Number,
      default: 0,
    },
    taxCollected: {
      type: Number,
      default: 0,
    },
    refunds: {
      type: Number,
      default: 0,
    },
    chartingData: mongoose.Schema.Types.Mixed,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------------
// INDEXES
// ----------------------------------------------------------

salesAnalyticsSchema.index({ date: -1 });
trafficAnalyticsSchema.index({ date: -1 });
revenueAnalyticsSchema.index({ date: -1 });

// ----------------------------------------------------------
// PRE-VALIDATE HOOKS
// ----------------------------------------------------------

salesAnalyticsSchema.pre('validate', async function (next) {
  if (!this.publicId) {
    const { generatePrefixedUUID } = require('../../utils/uuid');
    this.publicId = generatePrefixedUUID('SA');
  }
  next();
});

trafficAnalyticsSchema.pre('validate', async function (next) {
  if (!this.publicId) {
    const { generatePrefixedUUID } = require('../../utils/uuid');
    this.publicId = generatePrefixedUUID('TA');
  }
  next();
});

revenueAnalyticsSchema.pre('validate', async function (next) {
  if (!this.publicId) {
    const { generatePrefixedUUID } = require('../../utils/uuid');
    this.publicId = generatePrefixedUUID('RA');
  }
  next();
});

module.exports = {
  SalesAnalytics: mongoose.model('SalesAnalytics', salesAnalyticsSchema),
  TrafficAnalytics: mongoose.model(
    'TrafficAnalytics',
    trafficAnalyticsSchema
  ),
  RevenueAnalytics: mongoose.model(
    'RevenueAnalytics',
    revenueAnalyticsSchema
  ),
};
