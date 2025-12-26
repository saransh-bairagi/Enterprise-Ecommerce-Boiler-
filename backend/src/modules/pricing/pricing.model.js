const mongoose = require('mongoose');

// ----------------------------------------------------------
// PRICING RULE SCHEMA
// ----------------------------------------------------------

const pricingRuleSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['bulk', 'tier', 'percentage', 'fixed', 'seasonal'],
      required: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    conditions: {
      minQuantity: Number,
      maxQuantity: Number,
      minOrderAmount: Number,
      maxOrderAmount: Number,
      applicableCategories: [String],
      applicableProducts: [String],
      startDate: Date,
      endDate: Date,
      applicableDays: [Number], // 0-6 for days of week
      applicableCustomerTypes: [String], // regular, vip, new
    },
    discount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed_amount', 'fixed_price'],
      },
      value: Number,
      maxDiscount: Number,
      minDiscount: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
// BULK PRICING SCHEMA
// ----------------------------------------------------------

const bulkPricingSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    tiers: [
      {
        minQuantity: {
          type: Number,
          required: true,
        },
        maxQuantity: Number,
        price: {
          type: Number,
          required: true,
        },
        discount: Number,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
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
// TIER PRICING SCHEMA
// ----------------------------------------------------------

const tierPricingSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      enum: ['basic', 'silver', 'gold', 'platinum'],
    },
    description: String,
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    minSpend: {
      type: Number,
      default: 0,
    },
    benefits: [String],
    isActive: {
      type: Boolean,
      default: true,
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
// INDEXES
// ----------------------------------------------------------

pricingRuleSchema.index({ type: 1, isActive: 1 });
pricingRuleSchema.index({ priority: -1 });
bulkPricingSchema.index({ 'tiers.minQuantity': 1 });
tierPricingSchema.index({ minSpend: 1 });

// ----------------------------------------------------------
// PRE-VALIDATE HOOKS
// ----------------------------------------------------------

const hooks = () => {
  if (!this.publicId) {
    const { generatePrefixedUUID } = require('../../utils/uuid');
    this.publicId = generatePrefixedUUID('PRC');
  }
};

pricingRuleSchema.pre('validate', hooks);
bulkPricingSchema.pre('validate', hooks);
tierPricingSchema.pre('validate', hooks);

module.exports = {
  PricingRule: mongoose.model('PricingRule', pricingRuleSchema),
  BulkPricing: mongoose.model('BulkPricing', bulkPricingSchema),
  TierPricing: mongoose.model('TierPricing', tierPricingSchema),
};
