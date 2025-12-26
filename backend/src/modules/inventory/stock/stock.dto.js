/**
 * DTO helpers for Stock responses.
 */

function stockDTO(stock) {
  if (!stock) return null;

  return {
    id: stock._id || stock.id,
    publicId: stock.publicId,
    productId: stock.productId,
    variantId: stock.variantId,
    sku: stock.sku,
    quantity: stock.quantity,
    reserved: stock.reserved,
    available: stock.available,
    lowStockThreshold: stock.lowStockThreshold,
    warehouseId: stock.warehouseId,
    isLowStock: stock.available <= stock.lowStockThreshold,
    lastStockMovement: stock.lastStockMovement,
    createdAt: stock.createdAt,
    updatedAt: stock.updatedAt,
  };
}

function stocksDTO(stocks = []) {
  return stocks.map(stockDTO);
}

module.exports = {
  stockDTO,
  stocksDTO,
};
