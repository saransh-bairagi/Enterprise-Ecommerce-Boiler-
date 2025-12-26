const { ShipmentService, ShipmentAdminService } = require('./shipment.service');
const catchAsync = require('../../core/catchAsync');
const { sendSuccess } = require('../../core/response');
const AppError = require('../../core/appError');

const ShipmentController = {
  track: catchAsync(async (req, res) => {
    const shipment = await ShipmentService.trackShipment(req.params.trackingNumber);
    sendSuccess(res, shipment);
  }),

  getUserShipments: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
    };
    const data = await ShipmentService.getUserShipments(userId, q);
    sendSuccess(res, data);
  }),

  getByOrder: catchAsync(async (req, res) => {
    const shipment = await ShipmentService.getShipmentByOrder(req.params.orderId);
    sendSuccess(res, shipment);
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await ShipmentService.listShipments(q);
    sendSuccess(res, data);
  }),
};

const ShipmentAdminController = {
  create: catchAsync(async (req, res) => {
    const created = await ShipmentAdminService.createShipment(req.body);
    sendSuccess(res, created, 'Shipment created', 201);
  }),

  update: catchAsync(async (req, res) => {
    const updated = await ShipmentAdminService.updateShipment(
      req.params.id,
      req.body
    );
    sendSuccess(res, updated, 'Shipment updated');
  }),

  updateStatus: catchAsync(async (req, res) => {
    const { status } = req.body;
    if (!status) throw new AppError('Status required', 400);

    const updated = await ShipmentAdminService.updateStatus(
      req.params.id,
      status
    );
    sendSuccess(res, updated, `Shipment status updated to ${status}`);
  }),

  addTracking: catchAsync(async (req, res) => {
    const { trackingNumber, shippingProvider } = req.body;
    if (!trackingNumber || !shippingProvider) {
      throw new AppError('Tracking number and shipping provider required', 400);
    }

    const updated = await ShipmentAdminService.addTracking(
      req.params.id,
      trackingNumber,
      shippingProvider
    );
    sendSuccess(res, updated, 'Tracking info added');
  }),

  delete: catchAsync(async (req, res) => {
    const deleted = await ShipmentAdminService.deleteShipment(req.params.id);
    sendSuccess(res, deleted, 'Shipment deleted');
  }),

  restore: catchAsync(async (req, res) => {
    const restored = await ShipmentAdminService.restoreShipment(req.params.id);
    sendSuccess(res, restored, 'Shipment restored');
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await ShipmentAdminService.listShipments(q);
    sendSuccess(res, data);
  }),
};

module.exports = { ShipmentController, ShipmentAdminController };
