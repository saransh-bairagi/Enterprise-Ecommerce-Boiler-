const generatePrefixedUUID = require('../../utils/uuid').generatePrefixedUUID;
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ────────────── Notification Schema ──────────────
const NotificationSchema = new Schema({
  publicId: { type: String, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    enum: ['email', 'sms', 'push', 'in_app'], 
    required: true,
    index: true 
  },
  category: {
    type: String,
    enum: ['order', 'payment', 'shipment', 'review', 'promotion', 'account'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  recipient: { type: String }, // email, phone, or push token
  templateId: { type: String },
  data: { type: Schema.Types.Mixed }, // dynamic template data
  relatedId: { type: Schema.Types.ObjectId }, // order, payment, etc
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'bounced'],
    default: 'pending',
    index: true
  },
  sendAt: { type: Date, default: Date.now },
  sentAt: { type: Date },
  failureReason: { type: String },
  retryCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// ────────────── Pre-validate Hook ──────────────
NotificationSchema.pre('validate', function(next) {
  if (!this.publicId) {
    this.publicId = generatePrefixedUUID();
  }
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
