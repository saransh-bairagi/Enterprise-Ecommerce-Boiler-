/**
 * Return DTO
 */

function returnDTO(ret) {
  if (!ret) return null;

  return {
    id: ret._id || ret.id,
    publicId: ret.publicId,
    returnNumber: ret.returnNumber,
    orderId: ret.orderId,
    userId: ret.userId,
    items: ret.items,
    reason: ret.reason,
    description: ret.description,
    refundAmount: ret.refundAmount,
    refundStatus: ret.refundStatus,
    status: ret.status,
    initiatedAt: ret.initiatedAt,
    receivedAt: ret.receivedAt,
    inspectedAt: ret.inspectedAt,
    approvedAt: ret.approvedAt,
    refundedAt: ret.refundedAt,
    createdAt: ret.createdAt,
    updatedAt: ret.updatedAt,
  };
}

function returnsDTO(returns = []) {
  return returns.map(returnDTO);
}

module.exports = {
  returnDTO,
  returnsDTO,
};
