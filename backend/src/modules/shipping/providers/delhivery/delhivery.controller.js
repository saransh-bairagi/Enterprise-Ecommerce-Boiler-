const DelhiveryService = require('./delhivery.service');
const { sendSuccess, sendError } = require('../../../../core/response');
const AppError = require('../../../../core/appError');
const delhiveryService = new DelhiveryService();

exports.createShipment = async (req, res) => {
  try {
    const shipment = await delhiveryService.createShipment(req.body);
    return sendSuccess(res, shipment, 'Shipment created');
  } catch (err) {
    return sendError(res, err);
  }
};

exports.trackShipment = async (req, res) => {
  try {
    const data = await delhiveryService.trackShipment(req.params.shipmentId);
    return sendSuccess(res, data, 'Tracking info');
  } catch (err) {
    return sendError(res, err);
  }
};

exports.cancelShipment = async (req, res) => {
  try {
    const shipment = await delhiveryService.cancelShipment(req.params.shipmentId);
    return sendSuccess(res, shipment, 'Shipment cancelled');
  } catch (err) {
    return sendError(res, err);
  }
};

exports.getRates = async (req, res) => {
  try {
    const rates = await delhiveryService.getRates(req.query);
    return sendSuccess(res, rates, 'Rates fetched');
  } catch (err) {
    return sendError(res, err);
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    await delhiveryService.handleWebhook(req.body);
    return sendSuccess(res, {}, 'Webhook processed');
  } catch (err) {
    return sendError(res, err);
  }
};