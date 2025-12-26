const axios = require('axios');
const mongoose = require('mongoose');
const { API_BASE_URL, API_SHIPMENT_CREATE, API_SHIPMENT_TRACK, API_SHIPMENT_CANCEL, API_RATES, STATUS, RETRY_LIMIT, RETRY_BACKOFF_MS } = require('./delhivery.constants');
const dao = require('./delhivery.dao'); // path is correct, no change needed
const AppError = require('../../../../core/appError');
const catchAsync = require('../../../../core/catchAsync');
const logger = require('../../../../config/logger');

class DelhiveryService {
  constructor() {
    this.provider = STATUS.PROVIDER;
  }

  async _retryRequest(fn, args, attempt = 1) {
    try {
      return await fn(...args);
    } catch (err) {
      if (attempt < RETRY_LIMIT) {
        await new Promise(res => setTimeout(res, RETRY_BACKOFF_MS * attempt));
        return this._retryRequest(fn, args, attempt + 1);
      }
      logger.error('Delhivery API failed after retries', { error: err });
      throw new AppError('Delhivery API failed', 502);
    }
  }

  createShipment = catchAsync(async (shipmentData) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Call Delhivery API
      const apiRes = await this._retryRequest(
        (...args) => axios.post(`${API_BASE_URL}${API_SHIPMENT_CREATE}`, ...args),
        [shipmentData]
      );
      if (!apiRes.data.success) throw new AppError('Delhivery shipment creation failed', 400);
      // Save to DB only if API succeeds
      const shipment = await dao.createShipment({
        ...shipmentData,
        shipmentId: apiRes.data.shipmentId,
        provider: 'DELHIVERY',
        status: STATUS.CREATED,
        history: [{ status: STATUS.CREATED, at: new Date() }],
      }, session);
      await session.commitTransaction();
      return shipment;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  });

  trackShipment = catchAsync(async (shipmentId) => {
    const apiRes = await this._retryRequest(
      (...args) => axios.get(`${API_BASE_URL}${API_SHIPMENT_TRACK}/${shipmentId}`, ...args),
      []
    );
    if (!apiRes.data.success) throw new AppError('Delhivery tracking failed', 400);
    return apiRes.data;
  });

  cancelShipment = catchAsync(async (shipmentId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const apiRes = await this._retryRequest(
        (...args) => axios.post(`${API_BASE_URL}${API_SHIPMENT_CANCEL}/${shipmentId}`),
        []
      );
      if (!apiRes.data.success) throw new AppError('Delhivery cancellation failed', 400);
      const shipment = await dao.updateShipmentStatus(
        shipmentId,
        STATUS.CANCELLED,
        { status: STATUS.CANCELLED, at: new Date() },
        session
      );
      await session.commitTransaction();
      return shipment;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  });

  getRates = catchAsync(async (query) => {
    const apiRes = await this._retryRequest(
      (...args) => axios.get(`${API_BASE_URL}${API_RATES}`, ...args),
      [ { params: query } ]
    );
    if (!apiRes.data.success) throw new AppError('Delhivery rates fetch failed', 400);
    return apiRes.data;
  });

  handleWebhook = catchAsync(async (payload) => {
    // Log webhook
    logger.info('Delhivery webhook received', { payload });
    // Update shipment status/history
    const { shipmentId, event } = payload;
    await dao.addShipmentHistory(
      shipmentId,
      { status: event, at: new Date() }
    );
    return { success: true };
  });
}

module.exports = DelhiveryService;