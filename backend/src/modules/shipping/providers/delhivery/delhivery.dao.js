const mongoose = require('mongoose');
const Shipment = require('../../../../models/shipment.model');
const catchAsync = require('../../../../core/catchAsync');
const AppError = require('../../../../core/appError');

// DB operations for shipment
module.exports = {
  createShipment: catchAsync(async (shipmentData, session) => {
    const shipment = await Shipment.create([shipmentData], { session });
    return shipment[0];
  }),
  updateShipmentStatus: catchAsync(async (shipmentId, status, history, session) => {
    return await Shipment.findOneAndUpdate(
      { shipmentId },
      { $set: { status }, $push: { history } },
      { new: true, session }
    );
  }),
  getShipmentById: catchAsync(async (shipmentId) => {
    return await Shipment.findOne({ shipmentId });
  }),
  addShipmentHistory: catchAsync(async (shipmentId, history, session) => {
    return await Shipment.findOneAndUpdate(
      { shipmentId },
      { $push: { history } },
      { new: true, session }
    );
  }),
};