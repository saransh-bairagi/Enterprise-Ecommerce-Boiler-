const Address = require('./address.model');

const AddressDAO = {
  async create(addressData) {
    return await Address.create(addressData);
  },
  async findByUserId(userId) {
    return await Address.find({ userId });
  },
  async findById(addressId) {
    return await Address.findById(addressId);
  },
  async update(addressId, addressData) {
    return await Address.findByIdAndUpdate(addressId, addressData, { new: true });
  },
  async delete(addressId) {
    return await Address.findByIdAndDelete(addressId);
  }
};

module.exports = AddressDAO;
