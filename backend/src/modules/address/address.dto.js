/**
 * DTO helpers for Address responses.
 * Strips internal fields.
 */

function addressDTO(address) {
  if (!address) return null;
  return {
    id: address._id || address.id,
    userId: address.userId,
    firstName: address.firstName,
    lastName: address.lastName,
    email: address.email,
    phone: address.phone,
    street: address.street,
    city: address.city,
    state: address.state,
    country: address.country,
    zipCode: address.zipCode,
    type: address.type,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

function addressesDTO(addresses = []) {
  return addresses.map(addressDTO);
}

module.exports = {
  addressDTO,
  addressesDTO,
};
