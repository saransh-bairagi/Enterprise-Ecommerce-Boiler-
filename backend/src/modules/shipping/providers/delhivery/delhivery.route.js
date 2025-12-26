const express = require('express');
const controller = require('./delhivery.controller');
const middleware = require('./delhivery.middleware');

const router = express.Router();

router.post('/create-shipment', middleware.validateCreateShipment, controller.createShipment);
router.get('/track/:shipmentId', middleware.validateTrackShipment, controller.trackShipment);
router.post('/cancel/:shipmentId', middleware.validateCancelShipment, controller.cancelShipment);
router.get('/rates', middleware.validateRates, controller.getRates);
router.post('/webhook', middleware.validateWebhook, controller.handleWebhook);

module.exports = router;