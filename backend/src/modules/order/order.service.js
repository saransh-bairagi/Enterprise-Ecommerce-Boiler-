/**
 * Order + Order Admin Service
 * Business logic layer.
 */

const { OrderDAO, OrderAdminDAO } = require('./order.dao');
const AppError = require('../../core/appError');
const { orderDTO } = require('./order.dto');
const _ = require('lodash');
const Order = require('./order.model');
const ERROR = require('../../core/constants').ERRORS;
const logger = require('../../config/logger');

// In-memory idempotency stores for admin actions (replace with persistent store in production)
const orderCreateIdempotencyStore = new Map();
const orderUpdateIdempotencyStore = new Map();
const orderStatusIdempotencyStore = new Map();
const orderTrackingIdempotencyStore = new Map();
const orderPaymentIdempotencyStore = new Map();
const orderDeleteIdempotencyStore = new Map();
const orderRestoreIdempotencyStore = new Map();
const orderBulkStatusIdempotencyStore = new Map();

/* ----------------------------------------------------------
 * USER-FACING ORDER SERVICE
 * ----------------------------------------------------------*/
const OrderService = {
  // Get order by publicId
  getOrder: async (publicId) => {
    const order = await OrderDAO.findByPublicId(publicId);
    if (!order) throw new AppError(ERROR.ORDER_NOT_FOUND || 'Order not found', 404);
    return orderDTO(order);
  },

  // Get order by orderNumber
  getOrderByNumber: async (orderNumber) => {
    const order = await OrderDAO.findByOrderNumber(orderNumber);
    if (!order) throw new AppError(ERROR.ORDER_NOT_FOUND || 'Order not found', 404);
    return orderDTO(order);
  },

  // Get user's orders
  getUserOrders: async (userId, query = {}) => {
    const { page = 1, limit = 20, status = null } = query;
    const filter = { userId };
    if (status) filter.status = status;

    const res = await OrderDAO.list(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(orderDTO);
    return res;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const order = await OrderDAO.findById(id);
    if (!order) throw new AppError(ERROR.ORDER_NOT_FOUND || 'Order not found', 404);
    return orderDTO(order);
  },

  // Track order
  trackOrder: async (orderNumber) => {
    const order = await OrderDAO.findByOrderNumber(orderNumber);
    if (!order) throw new AppError(ERROR.ORDER_NOT_FOUND || 'Order not found', 404);

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
      shippingProvider: order.shippingProvider,
      items: order.items,
      updatedAt: order.updatedAt,
    };
  },

  // List orders (public)
  listOrders: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await OrderDAO.list(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(orderDTO);
    return res;
  },
};

/* ----------------------------------------------------------
 * ADMIN SERVICE (full control)
 * ----------------------------------------------------------*/
const OrderAdminService = {
  createOrder: async (data, idempotencyKey) => {
    if (idempotencyKey && orderCreateIdempotencyStore.has(idempotencyKey)) {
      logger.info(`[IDEMPOTENCY] Returning cached order for key: ${idempotencyKey}`);
      return orderDTO(orderCreateIdempotencyStore.get(idempotencyKey));
    }
    const created = await OrderAdminDAO.create(data);
    if (idempotencyKey) {
      orderCreateIdempotencyStore.set(idempotencyKey, created);
      logger.info(`[IDEMPOTENCY] Stored order for key: ${idempotencyKey}`);
    }
    return orderDTO(created);
  },

  updateOrder: async (publicId, update, userId, idempotencyKey) => {
    const key = idempotencyKey ? `${publicId}:${idempotencyKey}` : null;
    if (key && orderUpdateIdempotencyStore.has(key)) {
      logger.info(`[IDEMPOTENCY] Returning cached order update for key: ${key}`);
      return orderDTO(orderUpdateIdempotencyStore.get(key));
    }
    const orderDoc = await OrderDAO.publicIdToId(publicId);
    if (!orderDoc) throw new AppError(ERROR.ORDER_NOT_FOUND || 'Order not found', 404);
    const updated = await OrderAdminDAO.updateById(
      orderDoc._id,
      { ...update, updatedBy: userId },
      { new: true }
    );
    if (key) {
      orderUpdateIdempotencyStore.set(key, updated);
      logger.info(`[IDEMPOTENCY] Stored order update for key: ${key}`);
    }
    return orderDTO(updated);
  },

  updateOrderStatus: async (publicId, status, userId, idempotencyKey) => {
    const key = idempotencyKey ? `${publicId}:${status}:${idempotencyKey}` : null;
    if (key && orderStatusIdempotencyStore.has(key)) {
      logger.info(`[IDEMPOTENCY] Returning cached order status update for key: ${key}`);
      return orderDTO(orderStatusIdempotencyStore.get(key));
    }
    const orderDoc = await OrderDAO.publicIdToId(publicId);
    if (!orderDoc) throw new AppError(ERROR.ORDER_NOT_FOUND || 'Order not found', 404);
    const updated = await OrderAdminDAO.updateStatus(orderDoc._id, status, userId);
    if (key) {
      orderStatusIdempotencyStore.set(key, updated);
      logger.info(`[IDEMPOTENCY] Stored order status update for key: ${key}`);
    }
    return orderDTO(updated);
  },

  addTracking: async (publicId, trackingNumber, shippingProvider, userId, idempotencyKey) => {
    const key = idempotencyKey ? `${publicId}:${trackingNumber}:${idempotencyKey}` : null;
    if (key && orderTrackingIdempotencyStore.has(key)) {
      logger.info(`[IDEMPOTENCY] Returning cached tracking add for key: ${key}`);
      return orderDTO(orderTrackingIdempotencyStore.get(key));
    }
    const orderDoc = await OrderDAO.publicIdToId(publicId);
    if (!orderDoc) throw new AppError(ERROR.ORDER_NOT_FOUND || 'Order not found', 404);
    const updated = await OrderAdminDAO.addTracking(
      orderDoc._id,
      trackingNumber,
      shippingProvider
    );
    if (key) {
      orderTrackingIdempotencyStore.set(key, updated);
      logger.info(`[IDEMPOTENCY] Stored tracking add for key: ${key}`);
    }
    return orderDTO(updated);
  },

  updatePayment: async (publicId, paymentData, userId, idempotencyKey) => {
    const key = idempotencyKey ? `${publicId}:${idempotencyKey}` : null;
    if (key && orderPaymentIdempotencyStore.has(key)) {
      logger.info(`[IDEMPOTENCY] Returning cached payment update for key: ${key}`);
      return orderDTO(orderPaymentIdempotencyStore.get(key));
    }
    const orderDoc = await OrderDAO.publicIdToId(publicId);
    if (!orderDoc) throw new AppError(ERROR.ORDER_NOT_FOUND || 'Order not found', 404);
    const updated = await OrderAdminDAO.updatePayment(orderDoc._id, paymentData);
    if (key) {
      orderPaymentIdempotencyStore.set(key, updated);
      logger.info(`[IDEMPOTENCY] Stored payment update for key: ${key}`);
    }
    return orderDTO(updated);
  },

  deleteOrder: async (publicId, userId, idempotencyKey) => {
    const key = idempotencyKey ? `${publicId}:${idempotencyKey}` : null;
    if (key && orderDeleteIdempotencyStore.has(key)) {
      logger.info(`[IDEMPOTENCY] Returning cached order delete for key: ${key}`);
      return orderDTO(orderDeleteIdempotencyStore.get(key));
    }
    const orderDoc = await OrderDAO.publicIdToId(publicId);
    if (!orderDoc) throw new AppError(ERROR.ORDER_NOT_FOUND || 'Order not found', 404);
    const deleted = await OrderAdminDAO.softDelete(orderDoc._id);
    if (key) {
      orderDeleteIdempotencyStore.set(key, deleted);
      logger.info(`[IDEMPOTENCY] Stored order delete for key: ${key}`);
    }
    return orderDTO(deleted);
  },

  restoreOrder: async (publicId, idempotencyKey) => {
    const key = idempotencyKey ? `${publicId}:${idempotencyKey}` : null;
    if (key && orderRestoreIdempotencyStore.has(key)) {
      logger.info(`[IDEMPOTENCY] Returning cached order restore for key: ${key}`);
      return orderDTO(orderRestoreIdempotencyStore.get(key));
    }
    const orderDoc = await OrderDAO.publicIdToId(publicId);
    if (!orderDoc) throw new AppError(ERROR.ORDER_NOT_FOUND || 'Order not found', 404);
    const restored = await OrderAdminDAO.restore(orderDoc._id);
    if (key) {
      orderRestoreIdempotencyStore.set(key, restored);
      logger.info(`[IDEMPOTENCY] Stored order restore for key: ${key}`);
    }
    return orderDTO(restored);
  },

  bulkUpdateStatus: async (filters, status, userId, idempotencyKey) => {
    const key = idempotencyKey ? `${JSON.stringify(filters)}:${status}:${idempotencyKey}` : null;
    if (key && orderBulkStatusIdempotencyStore.has(key)) {
      logger.info(`[IDEMPOTENCY] Returning cached bulk status update for key: ${key}`);
      return orderBulkStatusIdempotencyStore.get(key);
    }
    const result = await OrderAdminDAO.bulkUpdateStatus(filters, status, userId);
    const response = {
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} orders updated to ${status}`,
    };
    if (key) {
      orderBulkStatusIdempotencyStore.set(key, response);
      logger.info(`[IDEMPOTENCY] Stored bulk status update for key: ${key}`);
    }
    return response;
  },
};

module.exports = { OrderService, OrderAdminService };
