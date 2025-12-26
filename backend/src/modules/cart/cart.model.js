const generatePrefixedUUID = require('../../utils/uuid').generatePrefixedUUID;
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ────────────── Cart Item Subschema ──────────────
const CartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  mrp: { type: Number },
  discount: { type: Number, default: 0 },
  addedAt: { type: Date, default: Date.now }
}, { _id: true });

// ────────────── Main Cart Schema ──────────────
const CartSchema = new Schema({
  publicId: { type: String, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [CartItemSchema],
  totalItems: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  couponCode: { type: String },
  couponDiscount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days
  lastModifiedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ────────────── Pre-validate Hook ──────────────
CartSchema.pre('validate', function(next) {
  if (!this.publicId) {
    this.publicId = generatePrefixedUUID();
  }
  next();
});

// ────────────── Instance Methods ──────────────
CartSchema.methods.addItem = function(item) {
  const existingItem = this.items.find(i => i.sku === item.sku);
  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    this.items.push(item);
  }
  this.totalItems = this.items.reduce((sum, i) => sum + i.quantity, 0);
  return this.save();
};

CartSchema.methods.removeItem = function(sku) {
  this.items = this.items.filter(i => i.sku !== sku);
  this.totalItems = this.items.reduce((sum, i) => sum + i.quantity, 0);
  return this.save();
};

CartSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.tax = this.subtotal * 0.18; // 18% tax
  this.total = this.subtotal + this.tax - this.couponDiscount;
  return this.save();
};

module.exports = mongoose.model('Cart', CartSchema);
