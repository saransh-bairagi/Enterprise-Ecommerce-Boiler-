const WishlistDAO = require('./wishlist.dao');
const { wishlistDTO } = require('./wishlist.dto');

const WishlistService = {
  async getWishlistByUser(userId) {
    const wishlist = await WishlistDAO.findByUserId(userId);
    return wishlistDTO(wishlist);
  },
  async addItem(userId, productId) {
    const wishlist = await WishlistDAO.addItem(userId, productId);
    return wishlistDTO(wishlist);
  },
  async removeItem(userId, productId) {
    const wishlist = await WishlistDAO.removeItem(userId, productId);
    return wishlistDTO(wishlist);
  },
  async deleteWishlist(wishlistId) {
    return await WishlistDAO.delete(wishlistId);
  }
};

module.exports = WishlistService;
