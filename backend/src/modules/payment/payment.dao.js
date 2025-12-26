const Transaction = require('./payment.model');

/**
 * PAYMENT DAO (Data Access Object)
 * Handles all database queries related to payments
 */

// ----------------------------------------------------------
// PUBLIC DAO
// ----------------------------------------------------------

const PaymentDAO = {
  async findById(id, session = undefined) {
    const query = Transaction.findOne({
      publicId: id,
      isDeleted: false,
    }).lean();
    if (session) query.session(session);
    return query.exec();
  },

  async findByOrderId(orderId, session = undefined) {
    const query = Transaction.findOne({
      orderId,
      isDeleted: false,
    }).lean();
    if (session) query.session(session);
    return query.exec();
  },

  async findByTransactionId(transactionId, session = undefined) {
    const query = Transaction.findOne({
      transactionId,
      isDeleted: false,
    }).lean();
    if (session) query.session(session);
    return query.exec();
  },

  async findByUserId(userId, options = {}, session = undefined) {
    const { page = 1, limit = 10, status } = options;
    const filter = { userId, isDeleted: false };
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const total = await Transaction.countDocuments(filter);
    const query = Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    if (session) query.session(session);
    const items = await query.exec();
    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },

  async list(filter = {}, options = {}, session = undefined) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const finalFilter = { isDeleted: false, ...filter };
    const total = await Transaction.countDocuments(finalFilter);
    const query = Transaction.find(finalFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    if (session) query.session(session);
    const items = await query.exec();
    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },
};

// ----------------------------------------------------------
// ADMIN DAO
// ----------------------------------------------------------

const PaymentAdminDAO = {
  async create(data) {
    const transaction = new Transaction(data);
    return transaction.save();
  },

  async updateById(id, data) {
    return Transaction.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );
  },

  async updateByOrderId(orderId, data) {
    return Transaction.findOneAndUpdate(
      { orderId, isDeleted: false },
      { $set: data },
      { new: true }
    );
  },

  async updateStatus(id, status, metadata = {}) {
    return Transaction.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      {
        $set: { status, ...metadata },
      },
      { new: true }
    );
  },

  async addRefund(id, refundData) {
    return Transaction.findOneAndUpdate(
      { publicId: id, isDeleted: false },
      {
        $push: { refunds: refundData },
        $set: { status: 'refunded' },
      },
      { new: true }
    );
  },

  async deleteById(id) {
    return Transaction.findOneAndUpdate(
      { publicId: id },
      { $set: { isDeleted: true } },
      { new: true }
    );
  },

  async bulkUpdateStatus(transactionIds, status) {
    return Transaction.updateMany(
      { publicId: { $in: transactionIds }, isDeleted: false },
      { $set: { status } }
    );
  },

  async getByStatus(status, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const total = await Transaction.countDocuments({
      status,
      isDeleted: false,
    });

    const items = await Transaction.find({
      status,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  },
};

module.exports = {
  PaymentDAO,
  PaymentAdminDAO,
};
