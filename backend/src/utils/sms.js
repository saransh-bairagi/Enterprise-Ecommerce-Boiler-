// src/utils/sms.js
const twilio = require('twilio');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, NODE_ENV } = require('../config/env');
const logger = require('../config/logger');

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Send SMS
 * @param {string} to - recipient phone number with country code, e.g., '+919876543210'
 * @param {string} body - message body
 */
const sendSMS = async (to, body) => {
  try {
    if (NODE_ENV !== 'production') {
      logger.info(`[DEV] SMS to ${to}: ${body}`);
      return;
    }

    const message = await client.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to,
    });

    logger.info(`SMS sent successfully to ${to} ✅ SID: ${message.sid}`);
    return message;
  } catch (err) {
    logger.error(`Failed to send SMS to ${to} ❌`, err);
    throw err;
  }
};

module.exports = { sendSMS };
