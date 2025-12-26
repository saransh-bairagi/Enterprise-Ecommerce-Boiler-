const AddressDAO = require('./address.dao');
const { addressDTO, addressesDTO } = require('./address.dto');

const AddressService = {
  async createAddress(userId, addressData) {
    const address = await AddressDAO.create({ userId, ...addressData });
    return addressDTO(address);
  },
  async getAddressesByUser(userId) {
    const addresses = await AddressDAO.findByUserId(userId);
    return addressesDTO(addresses);
  },
  async getAddressById(addressId) {
    const address = await AddressDAO.findById(addressId);
    return addressDTO(address);
  },
  async updateAddress(addressId, addressData) {
    const address = await AddressDAO.update(addressId, addressData);
    return addressDTO(address);
  },
  async deleteAddress(addressId) {
    return await AddressDAO.delete(addressId);
  }
};

module.exports = AddressService;
