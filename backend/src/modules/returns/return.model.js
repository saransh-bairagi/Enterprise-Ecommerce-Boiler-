const generatePrefixedUUID = require('../../utils/uuid').generatePrefixedUUID;
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ────────────── Return Item Subschema ──────────────
const ReturnItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  reason: { type: String },
  condition: { type: String, enum: ['unopened', 'opened', 'damaged'], required: true },
}, { _id: true });

// ────────────── Main Return Schema ──────────────
const ReturnSchema = new Schema({
  publicId: { type: String, unique: true },
  returnNumber: { type: String, unique: true, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [ReturnItemSchema],
  reason: { type: String, required: true },
  description: { type: String },
  refundAmount: { type: Number, required: true },
  refundStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending',
    index: true,
  },
  status: {
    type: String,
    enum: ['initiated', 'received', 'inspected', 'approved', 'rejected', 'refunded'],
    default: 'initiated',
    index: true,
  },
  initiatedAt: { type: Date, default: Date.now },
  receivedAt: { type: Date },
  inspectedAt: { type: Date },
  inspectionNotes: { type: String },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  refundedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ────────────── Pre-validate Hook ──────────────
ReturnSchema.pre('validate', function(next) {
  if (!this.publicId) {
    this.publicId = generatePrefixedUUID();
  }
  
  if (!this.returnNumber) {
    this.returnNumber = `RET-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  
  next();
});

module.exports = mongoose.model('Return', ReturnSchema);
