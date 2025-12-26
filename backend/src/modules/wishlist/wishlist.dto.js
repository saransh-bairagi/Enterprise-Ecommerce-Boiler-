/**
 * DTO helpers for Wishlist responses.
 */

function wishlistDTO(wishlist) {
  if (!wishlist) return null;
  return {
    id: wishlist._id || wishlist.id,
    userId: wishlist.userId,
    items: (wishlist.items || []).map(item => ({
      productId: item.productId,
      addedAt: item.addedAt
    })),
    createdAt: wishlist.createdAt,
    updatedAt: wishlist.updatedAt,
  };
}

module.exports = {
  wishlistDTO,
};
