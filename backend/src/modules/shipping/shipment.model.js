const generatePrefixedUUID = require('../../utils/uuid').generatePrefixedUUID;
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ────────────── Shipping Method Subschema ──────────────
const ShippingMethodSchema = new Schema({
  name: { type: String, required: true },
  provider: { type: String, required: true },
  basePrice: { type: Number, required: true },
  estimatedDays: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { _id: true });

// ────────────── Main Shipment Schema ──────────────
const ShipmentSchema = new Schema({
  publicId: { type: String, unique: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  shippingAddress: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
  trackingNumber: { type: String, unique: true, sparse: true },
  shippingProvider: { type: String },
  shippingMethod: { type: String },
  shippingCost: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'picked', 'shipped', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending',
    index: true,
  },
  estimatedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  weight: { type: Number }, // in kg
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  items: [
    {
      productId: Schema.Types.ObjectId,
      sku: String,
      quantity: Number,
    },
  ],
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// ────────────── Pre-validate Hook ──────────────
ShipmentSchema.pre('validate', function(next) {
  if (!this.publicId) {
    this.publicId = generatePrefixedUUID();
  }
  next();
});

module.exports = mongoose.models.Shipment || mongoose.model('Shipment', ShipmentSchema);
