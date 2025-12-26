const generatePrefixedUUID = require('../../utils/uuid').generatePrefixedUUID;
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ────────────── Main Review Schema ──────────────
const ReviewSchema = new Schema({
  publicId: { type: String, unique: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' }, // purchased item
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, required: true },
  content: { type: String },
  images: [{ type: String }],
  verified: { type: Boolean, default: false }, // verified purchase
  helpful: { type: Number, default: 0 },
  unhelpful: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isDeleted: { type: Boolean, default: false },
  rejectionReason: { type: String },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
}, { timestamps: true });

// ────────────── Pre-validate Hook ──────────────
ReviewSchema.pre('validate', function(next) {
  if (!this.publicId) {
    this.publicId = generatePrefixedUUID();
  }
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);
