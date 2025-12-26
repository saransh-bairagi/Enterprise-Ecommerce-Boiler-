const { OrderService, OrderAdminService } = require('./order.service');
const catchAsync = require('../../core/catchAsync');
const { sendSuccess } = require('../../core/response');
const AppError = require('../../core/appError');

/* ----------------------------------------------------------
 * USER-FACING CONTROLLERS
 * ----------------------------------------------------------*/
const OrderController = {
  getOrder: catchAsync(async (req, res) => {
    const order = await OrderService.getOrder(req.params.publicId);
    sendSuccess(res, order);
  }),

  getOrderByNumber: catchAsync(async (req, res) => {
    const order = await OrderService.getOrderByNumber(req.params.orderNumber);
    sendSuccess(res, order);
  }),

  getUserOrders: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      status: req.query.status || null,
    };
    const data = await OrderService.getUserOrders(userId, q);
    sendSuccess(res, data);
  }),

  trackOrder: catchAsync(async (req, res) => {
    const tracking = await OrderService.trackOrder(req.params.orderNumber);
    sendSuccess(res, tracking);
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await OrderService.listOrders(q);
    sendSuccess(res, data);
  }),
};

/* ----------------------------------------------------------
 * ADMIN CONTROLLERS
 * ----------------------------------------------------------*/
const OrderAdminController = {
  create: catchAsync(async (req, res) => {
    const payload = { ...req.body, createdBy: req.attachedSECRET?.userId };
    const created = await OrderAdminService.createOrder(payload);
    sendSuccess(res, created, 'Order created', 201);
  }),

  update: catchAsync(async (req, res) => {
    const updated = await OrderAdminService.updateOrder(
      req.params.publicId,
      req.body,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, updated, 'Order updated');
  }),

  updateStatus: catchAsync(async (req, res) => {
    const { status } = req.body;
    if (!status) throw new AppError('Status is required', 400);

    const updated = await OrderAdminService.updateOrderStatus(
      req.params.publicId,
      status,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, updated, `Order status updated to ${status}`);
  }),

  addTracking: catchAsync(async (req, res) => {
    const { trackingNumber, shippingProvider } = req.body;
    if (!trackingNumber || !shippingProvider) {
      throw new AppError('Tracking number and shipping provider required', 400);
    }

    const updated = await OrderAdminService.addTracking(
      req.params.publicId,
      trackingNumber,
      shippingProvider,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, updated, 'Tracking info added');
  }),

  updatePayment: catchAsync(async (req, res) => {
    const { transactionId, status, amount } = req.body;
    if (!status || !amount) {
      throw new AppError('Payment status and amount required', 400);
    }

    const paymentData = {
      method: req.body.method || 'cod',
      transactionId,
      status,
      amount,
      paidAt: new Date(),
    };

    const updated = await OrderAdminService.updatePayment(
      req.params.publicId,
      paymentData,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, updated, 'Payment info updated');
  }),

  delete: catchAsync(async (req, res) => {
    const deleted = await OrderAdminService.deleteOrder(
      req.params.publicId,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, deleted, 'Order deleted');
  }),

  restore: catchAsync(async (req, res) => {
    const restored = await OrderAdminService.restoreOrder(req.params.publicId);
    sendSuccess(res, restored, 'Order restored');
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
      sortBy: req.query.sortBy || '-createdAt',
    };
    const data = await OrderAdminService.listOrders(q);
    sendSuccess(res, data);
  }),

  getByStatus: catchAsync(async (req, res) => {
    const { status } = req.params;
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
    };
    const data = await OrderAdminService.getOrdersByStatus(status, q);
    sendSuccess(res, data);
  }),

  bulkUpdateStatus: catchAsync(async (req, res) => {
    const { filters, status } = req.body;
    if (!status) throw new AppError('Status is required', 400);

    const result = await OrderAdminService.bulkUpdateStatus(
      filters,
      status,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, result, 'Orders updated in bulk');
  }),
};

module.exports = { OrderController, OrderAdminController };
