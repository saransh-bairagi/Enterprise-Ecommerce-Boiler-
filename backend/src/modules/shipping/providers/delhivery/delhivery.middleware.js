const { body, param } = require('express-validator');

exports.validateCreateShipment = [
  body('orderId').notEmpty(),
  body('pickup').isObject(),
  body('delivery').isObject(),
];

exports.validateTrackShipment = [
  param('shipmentId').notEmpty(),
];

exports.validateCancelShipment = [
  param('shipmentId').notEmpty(),
];

exports.validateRates = [];

exports.validateWebhook = [
  body('event').notEmpty(),
  body('shipmentId').notEmpty(),
];