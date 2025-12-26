/**
 * DTO helpers for Order responses.
 * Strips sensitive/internal fields.
 */

function orderItemDTO(item) {
  if (!item) return null;

  return {
    id: item._id || item.id,
    productId: item.productId,
    variantId: item.variantId,
    sku: item.sku,
    quantity: item.quantity,
    price: item.price,
    mrp: item.mrp,
    discount: item.discount,
    total: item.total,
  };
}

const AddressService = require('../address/address.service');
const mongoose = require('mongoose');
async function addressDTO(address) {
  if (!address) return null;
  // If address is ObjectId, fetch from AddressService
  if (mongoose.Types.ObjectId.isValid(address) && typeof address === 'string') {
    const addr = await AddressService.getAddressById(address);
    if (!addr) return null;
    address = addr;
  }
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    email: address.email,
    phone: address.phone,
    street: address.street,
    city: address.city,
    state: address.state,
    country: address.country,
    zipCode: address.zipCode,
  };
}

function paymentDTO(payment) {
  if (!payment) return null;

  return {
    method: payment.method,
    transactionId: payment.transactionId,
    status: payment.status,
    amount: payment.amount,
    paidAt: payment.paidAt,
  };
}

function orderDTO(order) {
  if (!order) return null;

  return {
    id: order._id || order.id,
    publicId: order.publicId,
    orderNumber: order.orderNumber,
    userId: order.userId,
    items: (order.items || []).map(orderItemDTO),
    shippingAddress: addressDTO(order.shippingAddress),
    billingAddress: addressDTO(order.billingAddress),
    subtotal: order.subtotal,
    discount: order.discount,
    tax: order.tax,
    shippingCost: order.shippingCost,
    couponCode: order.couponCode,
    couponDiscount: order.couponDiscount,
    total: order.total,
    payment: paymentDTO(order.payment),
    status: order.status,
    trackingNumber: order.trackingNumber,
    shippingProvider: order.shippingProvider,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function ordersDTO(orders = []) {
  return orders.map(orderDTO);
}

module.exports = {
  orderDTO,
  ordersDTO,
  orderItemDTO,
  addressDTO,
  paymentDTO,
};
