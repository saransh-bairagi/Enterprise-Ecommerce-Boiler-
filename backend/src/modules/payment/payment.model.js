const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      unique: true,
      sparse: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'netbanking', 'upi', 'wallet'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    provider: {
      type: String,
      enum: ['stripe', 'razorpay', 'paypal'],
      default: 'razorpay',
    },
    providerTransactionId: {
      type: String,
      index: true,
    },
    processingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    refunds: [
      {
        refundId: String,
        amount: Number,
        reason: String,
        status: String,
        processedAt: Date,
      },
    ],
    retryCount: {
      type: Number,
      default: 0,
    },
    errorMessage: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// ----------------------------------------------------------
// INDEXES
// ----------------------------------------------------------

transactionSchema.index({ orderId: 1, status: 1 });
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ createdAt: -1 });

// ----------------------------------------------------------
// PRE-VALIDATE HOOK
// ----------------------------------------------------------

transactionSchema.pre('validate', async function (next) {
  if (!this.publicId) {
    const { generatePrefixedUUID } = require('../../utils/uuid');
    this.publicId = generatePrefixedUUID('TXN');
  }
  next();
});

// ----------------------------------------------------------
// INSTANCE METHODS
// ----------------------------------------------------------

transactionSchema.methods.calculateFee = function (baseAmount, feePercentage = 2) {
  this.processingFee = (baseAmount * feePercentage) / 100;
  return this.processingFee;
};

transactionSchema.methods.canRetry = function () {
  return (
    this.status === 'failed' &&
    this.retryCount < 3 &&
    Date.now() - this.updatedAt < 300000
  ); // 5 minutes
};

transactionSchema.methods.addRefund = function (refundId, amount, reason) {
  this.refunds.push({
    refundId,
    amount,
    reason,
    status: 'pending',
    processedAt: new Date(),
  });
  return this;
};

// ----------------------------------------------------------
// STATIC METHODS
// ----------------------------------------------------------

transactionSchema.statics.findByTransactionId = async function (transactionId) {
  return this.findOne({
    transactionId,
    isDeleted: false,
  });
};

transactionSchema.statics.findByOrderId = async function (orderId) {
  return this.findOne({
    orderId,
    isDeleted: false,
  });
};

module.exports = mongoose.model('Transaction', transactionSchema);
