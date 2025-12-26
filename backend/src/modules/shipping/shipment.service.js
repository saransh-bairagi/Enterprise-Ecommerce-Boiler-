/**
 * Shipment Service
 */

const { ShipmentDAO, ShipmentAdminDAO } = require('./shipment.dao');
const { shipmentDTO } = require('./shipment.dto');
const AppError = require('../../core/appError');

const ShipmentService = {
  trackShipment: async (trackingNumber) => {
    const shipment = await ShipmentDAO.findByTrackingNumber(trackingNumber);
    if (!shipment) throw new AppError('Shipment not found', 404);
    return shipmentDTO(shipment);
  },

  getUserShipments: async (userId, query = {}) => {
    const res = await ShipmentDAO.findByUserId(userId, query);
    res.items = res.items.map(shipmentDTO);
    return res;
  },

  getShipmentByOrder: async (orderId) => {
    const shipment = await ShipmentDAO.findByOrderId(orderId);
    if (!shipment) throw new AppError('Shipment not found', 404);
    return shipmentDTO(shipment);
  },

  listShipments: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await ShipmentDAO.list(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(shipmentDTO);
    return res;
  },
};

const ShipmentAdminService = {
  createShipment: async (data) => {
    const created = await ShipmentAdminDAO.create(data);
    return shipmentDTO(created);
  },

  updateShipment: async (id, update) => {
    const updated = await ShipmentAdminDAO.updateById(id, update);
    if (!updated) throw new AppError('Shipment not found', 404);
    return shipmentDTO(updated);
  },

  updateStatus: async (id, status) => {
    const updated = await ShipmentAdminDAO.updateStatus(id, status);
    if (!updated) throw new AppError('Shipment not found', 404);
    return shipmentDTO(updated);
  },

  addTracking: async (id, trackingNumber, shippingProvider) => {
    const updated = await ShipmentAdminDAO.addTracking(id, trackingNumber, shippingProvider);
    if (!updated) throw new AppError('Shipment not found', 404);
    return shipmentDTO(updated);
  },

  deleteShipment: async (id) => {
    const deleted = await ShipmentAdminDAO.softDelete(id);
    if (!deleted) throw new AppError('Shipment not found', 404);
    return shipmentDTO(deleted);
  },

  restoreShipment: async (id) => {
    const restored = await ShipmentAdminDAO.restore(id);
    if (!restored) throw new AppError('Shipment not found', 404);
    return shipmentDTO(restored);
  },

  listShipments: async (query = {}) => {
    const { page = 1, limit = 20, filters = {} } = query;
    const res = await ShipmentDAO.list(filters, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.items = res.items.map(shipmentDTO);
    return res;
  },
};

module.exports = { ShipmentService, ShipmentAdminService };
