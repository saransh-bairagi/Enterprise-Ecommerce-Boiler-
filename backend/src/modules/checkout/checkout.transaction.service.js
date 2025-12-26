const mongoose = require('mongoose');
const PaymentService = require('../payment/payment.service');
const OrderService = require('../order/order.service');
const InventoryService = require('../inventory/stock/stock.service');
// Placeholder for IdempotencyService, will create if missing
let IdempotencyService;
try {
  IdempotencyService = require('../../common/idempotency/idempotency.service');
} catch (e) {
  IdempotencyService = { // fallback stub
    async get() { return null; },
    async save() {}
  };
}

class CheckoutTransactionService {
  static async processCheckout({
    userId,
    payload,
    idempotencyKey
  }) {
    // 1️⃣ Idempotency guard
    const existing = await IdempotencyService.get(idempotencyKey);
    if (existing) return existing.response;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 2️⃣ Create order (PENDING)
      const order = await OrderService.createPending(
        userId,
        payload,
        session
      );

      // 3️⃣ Capture payment
      const payment = await PaymentService.capture(
        order,
        payload.payment,
        session
      );

      // 4️⃣ Mark order PAID
      await OrderService.markPaid(
        order.id,
        payment.id,
        session
      );

      // 5️⃣ Decrement inventory
      await InventoryService.decreaseStock(
        order.items,
        session
      );

      await session.commitTransaction();
      session.endSession();

      // 6️⃣ Persist idempotency result
      await IdempotencyService.save(
        idempotencyKey,
        order
      );

      return order;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      // 7️⃣ Compensation
      await PaymentService.refundIfNeeded(payload.payment);

      throw err;
    }
  }
}

module.exports = CheckoutTransactionService;
