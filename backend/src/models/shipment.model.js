const mongoose = require('mongoose');

const shipmentHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  at: { type: Date, default: Date.now },
  details: { type: Object },
}, { _id: false });

const shipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  provider: { type: String, required: true },
  status: { type: String, required: true },
  pickup: { type: Object, required: true },
  delivery: { type: Object, required: true },
  history: { type: [shipmentHistorySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

shipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Shipment || mongoose.model('Shipment', shipmentSchema);