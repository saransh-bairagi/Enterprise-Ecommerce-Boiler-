const AddressService = require('./address.service');
const catchAsync = require('../../core/catchAsync');
const { sendSuccess } = require('../../core/response');
const AppError = require('../../core/appError');

const AddressController = {
  create: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const address = await AddressService.createAddress(userId, req.body);
    sendSuccess(res, address, 'Address created', 201);
  }),
  list: catchAsync(async (req, res) => {
    const userId = req.attachedSECRET?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);
    const addresses = await AddressService.getAddressesByUser(userId);
    sendSuccess(res, addresses);
  }),
  get: catchAsync(async (req, res) => {
    const address = await AddressService.getAddressById(req.params.id);
    if (!address) throw new AppError('Address not found', 404);
    sendSuccess(res, address);
  }),
  update: catchAsync(async (req, res) => {
    const address = await AddressService.updateAddress(req.params.id, req.body);
    if (!address) throw new AppError('Address not found', 404);
    sendSuccess(res, address, 'Address updated');
  }),
  delete: catchAsync(async (req, res) => {
    await AddressService.deleteAddress(req.params.id);
    sendSuccess(res, null, 'Address deleted');
  })
};

module.exports = AddressController;
