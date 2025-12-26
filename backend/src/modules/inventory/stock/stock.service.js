/**
 * Stock Service
 */

const { StockDAO, StockAdminDAO } = require('./stock.dao');
const { stockDTO } = require('./stock.dto');
const AppError = require('../../../core/appError');

const StockService = {
  getStock: async (sku) => {
    const stock = await StockDAO.findBySku(sku);
    if (!stock) throw new AppError('Stock not found', 404);
    return stockDTO(stock);
  },

  checkAvailability: async (sku, quantity) => {
    const stock = await StockDAO.findBySku(sku);
    if (!stock) throw new AppError('Stock not found', 404);
    
    return {
      available: stock.available >= quantity,
      quantity: stock.available,
      required: quantity,
    };
  },

  listLowStockItems: async (limit = 50) => {
    const items = await StockDAO.findLowStockItems(limit);
    return items.map(stockDTO);
  },

  listStocks: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await StockDAO.list(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(stockDTO);
    return res;
  },
};

const StockAdminService = {
  createStock: async (data) => {
    const existing = await StockDAO.findBySku(data.sku);
    if (existing) throw new AppError('SKU already exists', 409);

    const created = await StockAdminDAO.create(data);
    return stockDTO(created);
  },

  updateStock: async (id, update) => {
    const updated = await StockAdminDAO.updateById(id, update);
    if (!updated) throw new AppError('Stock not found', 404);
    return stockDTO(updated);
  },

  adjustStock: async (sku, quantity, reference, notes = '') => {
    const stock = await StockDAO.findBySku(sku);
    if (!stock) throw new AppError('Stock not found', 404);

    const updated = await StockAdminDAO.adjustStock(stock._id, quantity, reference, notes);
    return stockDTO(updated);
  },

  reserveStock: async (sku, quantity, orderId) => {
    const stock = await StockDAO.findBySku(sku);
    if (!stock) throw new AppError('Stock not found', 404);
    if (stock.available < quantity) throw new AppError('Insufficient stock', 400);

    const updated = await StockAdminDAO.reserve(stock._id, quantity, orderId);
    return stockDTO(updated);
  },

  unreserveStock: async (sku, quantity, orderId) => {
    const stock = await StockDAO.findBySku(sku);
    if (!stock) throw new AppError('Stock not found', 404);

    const updated = await StockAdminDAO.unreserve(stock._id, quantity, orderId);
    return stockDTO(updated);
  },

  listStocks: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await StockDAO.list(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(stockDTO);
    return res;
  },

  deleteStock: async (id) => {
    const deleted = await StockAdminDAO.softDelete(id);
    if (!deleted) throw new AppError('Stock not found', 404);
    return stockDTO(deleted);
  },

  restoreStock: async (id) => {
    const restored = await StockAdminDAO.restore(id);
    if (!restored) throw new AppError('Stock not found', 404);
    return stockDTO(restored);
  },
  decrementStock: async (sku, quantity, reference, notes = '') => {
    const stock = await StockDAO.findBySku(sku);
    if (!stock) throw new AppError('Stock not found', 404);
    if (stock.available < quantity) throw new AppError('Insufficient stock', 400);
    const updated = await StockAdminDAO.adjustStock(stock._id, -quantity, reference, notes);
    return stockDTO(updated);
  }
};

module.exports = { StockService, StockAdminService };
