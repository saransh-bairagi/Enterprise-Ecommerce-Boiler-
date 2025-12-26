/**
 * PAYMENT DTO
 * Data Transfer Object for payment responses
 */

const transactionDTO = (transaction) => {
  if (!transaction) return null;

  return {
    id: transaction.publicId,
    orderId: transaction.orderId,
    userId: transaction.userId,
    transactionId: transaction.transactionId,
    amount: transaction.amount,
    currency: transaction.currency,
    paymentMethod: transaction.paymentMethod,
    status: transaction.status,
    provider: transaction.provider,
    processingFee: transaction.processingFee,
    totalAmount: transaction.amount + transaction.processingFee,
    refunds: transaction.refunds || [],
    refundedAmount: (transaction.refunds || []).reduce(
      (sum, r) => sum + (r.amount || 0),
      0
    ),
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
};

const transactionListDTO = (transactions) => {
  return transactions.map(transactionDTO);
};

module.exports = {
  transactionDTO,
  transactionListDTO,
};
