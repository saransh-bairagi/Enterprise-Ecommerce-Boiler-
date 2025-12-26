const mongoose = require('mongoose');
const { Schema } = mongoose;
const { generatePrefixedUUID } = require('../../utils/uuid');

// ────────────── Main Promo Schema ──────────────
const PromoSchema = new Schema({
  publicId: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['banner', 'feature', 'spotlight'], required: true },
  imageUrl: { type: String },
  imageKey: { type: String },
  actionUrl: { type: String },
  position: { type: Number, default: 0 },
  targetProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  targetCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  clicks: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ────────────── Pre-validate Hook ──────────────
PromoSchema.pre('validate', function(next) {
  if (!this.publicId) {
    this.publicId = generatePrefixedUUID();
  }

  // Ensure startDate <= endDate
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    return next(new Error('startDate cannot be after endDate'));
  }

  next();
});

// ────────────── Instance Methods ──────────────
PromoSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && !this.isDeleted && now >= this.startDate && now <= this.endDate;
};

// Optional: increment clicks
PromoSchema.methods.incrementClicks = function() {
  this.clicks += 1;
  return this.save();
};

// Optional: increment impressions
PromoSchema.methods.incrementImpressions = function() {
  this.impressions += 1;
  return this.save();
};

module.exports = mongoose.model('Promo', PromoSchema);
