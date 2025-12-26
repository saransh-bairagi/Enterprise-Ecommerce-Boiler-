const { ReturnService, ReturnAdminService } = require('./return.service');
const {catchAsync} = require('../../core/catchAsync');
const { sendSuccess } = require('../../core/response');
const AppError = require('../../core/appError');

const ReturnController = {
  getReturn: catchAsync(async (req, res) => {
    const ret = await ReturnService.getReturn(req.params.returnNumber);
    sendSuccess(res, ret);
  }),

  getUserReturns: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
    };
    const data = await ReturnService.getUserReturns(userId, q);
    sendSuccess(res, data);
  }),

  getOrderReturns: catchAsync(async (req, res) => {
    const returns = await ReturnService.getOrderReturns(req.params.orderId);
    sendSuccess(res, returns);
  }),

  initiateReturn: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { orderId } = req.params;
    const ret = await ReturnService.initiateReturn(orderId, userId, req.body);
    sendSuccess(res, ret, 'Return initiated', 201);
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await ReturnService.listReturns(q);
    sendSuccess(res, data);
  }),
};

const ReturnAdminController = {
  create: catchAsync(async (req, res) => {
    const created = await ReturnAdminService.createReturn(req.body);
    sendSuccess(res, created, 'Return created', 201);
  }),

  update: catchAsync(async (req, res) => {
    const updated = await ReturnAdminService.updateReturn(req.params.id, req.body);
    sendSuccess(res, updated, 'Return updated');
  }),

  updateStatus: catchAsync(async (req, res) => {
    const { status, notes } = req.body;
    if (!status) throw new AppError('Status required', 400);

    const updated = await ReturnAdminService.updateStatus(
      req.params.id,
      status,
      notes
    );
    sendSuccess(res, updated, `Return status updated to ${status}`);
  }),

  approve: catchAsync(async (req, res) => {
    const approved = await ReturnAdminService.approveReturn(
      req.params.id,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, approved, 'Return approved');
  }),

  reject: catchAsync(async (req, res) => {
    const { rejectionReason } = req.body;
    if (!rejectionReason) throw new AppError('Rejection reason required', 400);

    const rejected = await ReturnAdminService.rejectReturn(
      req.params.id,
      rejectionReason,
      req.attachedSECRET?.userId
    );
    sendSuccess(res, rejected, 'Return rejected');
  }),

  processRefund: catchAsync(async (req, res) => {
    const refunded = await ReturnAdminService.processRefund(req.params.id);
    sendSuccess(res, refunded, 'Refund processed');
  }),

  delete: catchAsync(async (req, res) => {
    const deleted = await ReturnAdminService.deleteReturn(req.params.id);
    sendSuccess(res, deleted, 'Return deleted');
  }),

  restore: catchAsync(async (req, res) => {
    const restored = await ReturnAdminService.restoreReturn(req.params.id);
    sendSuccess(res, restored, 'Return restored');
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await ReturnAdminService.listReturns(q);
    sendSuccess(res, data);
  }),

  getPending: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
    };
    const data = await ReturnAdminService.getPendingReturns(q);
    sendSuccess(res, data);
  }),
};

module.exports = { ReturnController, ReturnAdminController };
