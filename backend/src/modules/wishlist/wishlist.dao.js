const Wishlist = require('./wishlist.model');

const WishlistDAO = {
  async create(wishlistData) {
    return await Wishlist.create(wishlistData);
  },
  async findByUserId(userId) {
    return await Wishlist.findOne({ userId });
  },
  async addItem(userId, productId) {
    return await Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { items: { productId, addedAt: new Date() } }, $set: { updatedAt: new Date() } },
      { upsert: true, new: true }
    );
  },
  async removeItem(userId, productId) {
    return await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } }, $set: { updatedAt: new Date() } },
      { new: true }
    );
  },
  async delete(wishlistId) {
    return await Wishlist.findByIdAndDelete(wishlistId);
  }
};

module.exports = WishlistDAO;
