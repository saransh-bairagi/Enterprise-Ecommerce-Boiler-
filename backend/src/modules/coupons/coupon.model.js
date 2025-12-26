const generatePrefixedUUID = require('../../utils/uuid').generatePrefixedUUID;
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ────────────── Main Coupon Schema ──────────────
const CouponSchema = new Schema({
  publicId: { type: String, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  description: { type: String },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount: { type: Number }, // for percentage discounts
  minOrderValue: { type: Number, default: 0 },
  maxUsagePerCoupon: { type: Number }, // total usage limit
  maxUsagePerUser: { type: Number, default: 1 }, // per user limit
  usageCount: { type: Number, default: 0 },
  applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  excludedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ────────────── Pre-validate Hook ──────────────
CouponSchema.pre('validate', function(next) {
  if (!this.publicId) {
    this.publicId = generatePrefixedUUID();
  }
  next();
});

// ────────────── Instance Methods ──────────────
CouponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    !this.isDeleted &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.maxUsagePerCoupon === undefined || this.usageCount < this.maxUsagePerCoupon)
  );
};

CouponSchema.methods.calculateDiscount = function(orderAmount) {
  if (this.discountType === 'percentage') {
    const discount = (orderAmount * this.discountValue) / 100;
    return Math.min(discount, this.maxDiscount || discount);
  }
  return Math.min(this.discountValue, orderAmount);
};

module.exports = mongoose.model('Coupon', CouponSchema);
