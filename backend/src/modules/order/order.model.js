const generatePrefixedUUID = require('../../utils/uuid').generatePrefixedUUID;
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ────────────── Order Item Subschema ──────────────
const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  mrp: { type: Number },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
}, { _id: true });

// ────────────── Address Reference ──────────────
// Now using Address model reference

// ────────────── Payment Info Subschema ──────────────
const PaymentSchema = new Schema({
  method: { type: String, enum: ['credit_card', 'debit_card', 'upi', 'wallet', 'cod'], required: true },
  transactionId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  amount: { type: Number, required: true },
  paidAt: { type: Date },
}, { _id: false });

// ────────────── Main Order Schema ──────────────
const OrderSchema = new Schema({
  publicId: { type: String, unique: true },
  orderNumber: { type: String, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [OrderItemSchema],
  shippingAddress: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
  billingAddress: { type: Schema.Types.ObjectId, ref: 'Address' },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  couponCode: { type: String },
  couponDiscount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  payment: PaymentSchema,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
    index: true,
  },
  trackingNumber: { type: String },
  shippingProvider: { type: String },
  notes: { type: String },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ────────────── Pre-validate Hook ──────────────
OrderSchema.pre('validate', function(next) {
  if (!this.publicId) {
    this.publicId = generatePrefixedUUID();
  }
  
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  
  next();
});

// ────────────── Instance Methods ──────────────
OrderSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.updatedBy = userId;
  return this.save();
};

OrderSchema.methods.updateStatus = function(newStatus, userId) {
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid order status');
  }
  this.status = newStatus;
  this.updatedBy = userId;
  return this.save();
};

module.exports = mongoose.model('Order', OrderSchema);
