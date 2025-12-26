/**
 * Return Service
 */

const { ReturnDAO, ReturnAdminDAO } = require('./return.dao');
const { returnDTO } = require('./return.dto');
const AppError = require('../../core/appError');

const ReturnService = {
  getReturn: async (returnNumber) => {
    const ret = await ReturnDAO.findByReturnNumber(returnNumber);
    if (!ret) throw new AppError('Return not found', 404);
    return returnDTO(ret);
  },

  getUserReturns: async (userId, query = {}) => {
    const res = await ReturnDAO.findByUserId(userId, query);
    res.items = res.items.map(returnDTO);
    return res;
  },

  getOrderReturns: async (orderId) => {
    const returns = await ReturnDAO.findByOrderId(orderId);
    return returns.map(returnDTO);
  },

  listReturns: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await ReturnDAO.list(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(returnDTO);
    return res;
  },

  initiateReturn: async (orderId, userId, data) => {
    const returnData = {
      orderId,
      userId,
      ...data,
    };

    const created = await ReturnAdminDAO.create(returnData);
    return returnDTO(created);
  },
};

const ReturnAdminService = {
  createReturn: async (data) => {
    const created = await ReturnAdminDAO.create(data);
    return returnDTO(created);
  },

  updateReturn: async (id, update) => {
    const updated = await ReturnAdminDAO.updateById(id, update);
    if (!updated) throw new AppError('Return not found', 404);
    return returnDTO(updated);
  },

  updateStatus: async (id, status, notes = '') => {
    const updated = await ReturnAdminDAO.updateStatus(id, status, notes);
    if (!updated) throw new AppError('Return not found', 404);
    return returnDTO(updated);
  },

  approveReturn: async (id, userId) => {
    const approved = await ReturnAdminDAO.approveReturn(id, userId);
    if (!approved) throw new AppError('Return not found', 404);
    return returnDTO(approved);
  },

  rejectReturn: async (id, rejectionReason, userId) => {
    const rejected = await ReturnAdminDAO.rejectReturn(id, rejectionReason, userId);
    if (!rejected) throw new AppError('Return not found', 404);
    return returnDTO(rejected);
  },

  processRefund: async (id) => {
    const refunded = await ReturnAdminDAO.processRefund(id);
    if (!refunded) throw new AppError('Return not found', 404);
    return returnDTO(refunded);
  },

  deleteReturn: async (id) => {
    const deleted = await ReturnAdminDAO.softDelete(id);
    if (!deleted) throw new AppError('Return not found', 404);
    return returnDTO(deleted);
  },

  restoreReturn: async (id) => {
    const restored = await ReturnAdminDAO.restore(id);
    if (!restored) throw new AppError('Return not found', 404);
    return returnDTO(restored);
  },

  listReturns: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await ReturnDAO.list(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(returnDTO);
    return res;
  },

  getPendingReturns: async (query = {}) => {
    const { page = 1, limit = 20 } = query;
    const res = await ReturnDAO.list({ status: 'initiated' }, {
      page,
      limit,
      sort: { createdAt: 1 },
    });
    res.items = res.items.map(returnDTO);
    return res;
  },
};

module.exports = { ReturnService, ReturnAdminService };
