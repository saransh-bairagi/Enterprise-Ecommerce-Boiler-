/**
 * DTO helpers for Shipment responses.
 */

const AddressService = require('../address/address.service');
const mongoose = require('mongoose');
async function shipmentDTO(shipment) {
  if (!shipment) return null;
  let address = shipment.shippingAddress;
  if (mongoose.Types.ObjectId.isValid(address) && typeof address === 'string') {
    address = await AddressService.getAddressById(address);
  }
  return {
    id: shipment._id || shipment.id,
    publicId: shipment.publicId,
    orderId: shipment.orderId,
    userId: shipment.userId,
    trackingNumber: shipment.trackingNumber,
    shippingProvider: shipment.shippingProvider,
    shippingMethod: shipment.shippingMethod,
    shippingCost: shipment.shippingCost,
    status: shipment.status,
    shippingAddress: address,
    estimatedDeliveryDate: shipment.estimatedDeliveryDate,
    actualDeliveryDate: shipment.actualDeliveryDate,
    items: shipment.items,
    createdAt: shipment.createdAt,
    updatedAt: shipment.updatedAt,
  };
}

function shipmentsDTO(shipments = []) {
  return shipments.map(shipmentDTO);
}

module.exports = {
  shipmentDTO,
  shipmentsDTO,
};
