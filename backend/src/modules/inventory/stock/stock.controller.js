const { StockService, StockAdminService } = require('./stock.service');
const catchAsync = require('../../../core/catchAsync');
const { sendSuccess } = require('../../../core/response');
const AppError = require('../../../core/appError');

const StockController = {
  getStock: catchAsync(async (req, res) => {
    const stock = await StockService.getStock(req.params.sku);
    sendSuccess(res, stock);
  }),

  checkAvailability: catchAsync(async (req, res) => {
    const { sku, quantity } = req.body;
    if (!sku || !quantity) {
      throw new AppError('SKU and quantity required', 400);
    }

    const availability = await StockService.checkAvailability(sku, quantity);
    sendSuccess(res, availability);
  }),

  listLowStockItems: catchAsync(async (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const items = await StockService.listLowStockItems(limit);
    sendSuccess(res, items);
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await StockService.listStocks(q);
    sendSuccess(res, data);
  }),
};

const StockAdminController = {
  create: catchAsync(async (req, res) => {
    const created = await StockAdminService.createStock(req.body);
    sendSuccess(res, created, 'Stock created', 201);
  }),

  update: catchAsync(async (req, res) => {
    const updated = await StockAdminService.updateStock(req.params.id, req.body);
    sendSuccess(res, updated, 'Stock updated');
  }),

  adjustStock: catchAsync(async (req, res) => {
    const { sku, quantity, reference, notes } = req.body;
    if (!sku || !quantity) {
      throw new AppError('SKU and quantity required', 400);
    }

    const updated = await StockAdminService.adjustStock(sku, quantity, reference, notes);
    sendSuccess(res, updated, 'Stock adjusted');
  }),

  reserve: catchAsync(async (req, res) => {
    const { sku, quantity, orderId } = req.body;
    if (!sku || !quantity || !orderId) {
      throw new AppError('SKU, quantity, and orderId required', 400);
    }

    const updated = await StockAdminService.reserveStock(sku, quantity, orderId);
    sendSuccess(res, updated, 'Stock reserved');
  }),

  unreserve: catchAsync(async (req, res) => {
    const { sku, quantity, orderId } = req.body;
    if (!sku || !quantity || !orderId) {
      throw new AppError('SKU, quantity, and orderId required', 400);
    }

    const updated = await StockAdminService.unreserveStock(sku, quantity, orderId);
    sendSuccess(res, updated, 'Stock unreserved');
  }),

  delete: catchAsync(async (req, res) => {
    const deleted = await StockAdminService.deleteStock(req.params.id);
    sendSuccess(res, deleted, 'Stock deleted');
  }),

  restore: catchAsync(async (req, res) => {
    const restored = await StockAdminService.restoreStock(req.params.id);
    sendSuccess(res, restored, 'Stock restored');
  }),

  list: catchAsync(async (req, res) => {
    const q = {
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 200),
      filters: req.query.filters || {},
    };
    const data = await StockAdminService.listStocks(q);
    sendSuccess(res, data);
  }),
};

module.exports = { StockController, StockAdminController };
