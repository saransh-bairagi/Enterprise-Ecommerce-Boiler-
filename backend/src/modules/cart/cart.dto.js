/**
 * DTO helpers for Cart responses.
 * Strips sensitive/internal fields.
 */

function cartItemDTO(item) {
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
    total: item.price * item.quantity,
    addedAt: item.addedAt
  };
}

function cartDTO(cart) {
  if (!cart) return null;

  return {
    id: cart._id || cart.id,
    publicId: cart.publicId,
    userId: cart.userId,
    items: (cart.items || []).map(cartItemDTO),
    totalItems: cart.totalItems || 0,
    subtotal: cart.subtotal || 0,
    discount: cart.discount || 0,
    tax: cart.tax || 0,
    couponCode: cart.couponCode || null,
    couponDiscount: cart.couponDiscount || 0,
    total: cart.total || 0,
    expiresAt: cart.expiresAt,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt
  };
}

function cartsDTO(carts = []) {
  return carts.map(cartDTO);
}

module.exports = {
  cartDTO,
  cartsDTO,
  cartItemDTO
};
