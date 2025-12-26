const generatePrefixedUUID = require('../../../utils/uuid').generatePrefixedUUID;
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ────────────── Stock Movement Subschema ──────────────
const StockMovementSchema = new Schema({
  type: { type: String, enum: ['in', 'out', 'adjustment', 'return'], required: true },
  quantity: { type: Number, required: true },
  reference: { type: String }, // order ID, return ID, etc
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

// ────────────── Main Stock Schema ──────────────
const StockSchema = new Schema({
  publicId: { type: String, unique: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  variantId: { type: Schema.Types.ObjectId },
  sku: { type: String, required: true, unique: true, index: true },
  quantity: { type: Number, required: true, default: 0 },
  reserved: { type: Number, default: 0 }, // reserved for pending orders
  available: { type: Number, default: 0 }, // available = quantity - reserved
  lowStockThreshold: { type: Number, default: 10 },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
  lastStockMovement: { type: Date },
  movements: [StockMovementSchema],
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// ────────────── Pre-validate Hook ──────────────
StockSchema.pre('validate', function(next) {
  if (!this.publicId) {
    this.publicId = generatePrefixedUUID();
  }
  // Calculate available stock
  this.available = Math.max(0, this.quantity - this.reserved);
  next();
});

// ────────────── Instance Methods ──────────────
StockSchema.methods.addStock = function(quantity, reference, notes = '') {
  this.quantity += quantity;
  this.movements.push({
    type: 'in',
    quantity,
    reference,
    notes,
  });
  this.lastStockMovement = new Date();
  this.available = Math.max(0, this.quantity - this.reserved);
  return this.save();
};

StockSchema.methods.removeStock = function(quantity, reference, notes = '') {
  if (quantity > this.available) {
    throw new Error('Insufficient stock');
  }
  this.quantity -= quantity;
  this.movements.push({
    type: 'out',
    quantity,
    reference,
    notes,
  });
  this.lastStockMovement = new Date();
  this.available = Math.max(0, this.quantity - this.reserved);
  return this.save();
};

StockSchema.methods.reserve = function(quantity, orderId) {
  if (quantity > this.available) {
    throw new Error('Insufficient available stock');
  }
  this.reserved += quantity;
  this.available = Math.max(0, this.quantity - this.reserved);
  return this.save();
};

StockSchema.methods.unreserve = function(quantity) {
  this.reserved = Math.max(0, this.reserved - quantity);
  this.available = Math.max(0, this.quantity - this.reserved);
  return this.save();
};

StockSchema.methods.isLowStock = function() {
  return this.available <= this.lowStockThreshold;
};

module.exports = mongoose.model('Stock', StockSchema);
