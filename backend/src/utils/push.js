// src/utils/push.js
// Simple push notification sender (e.g., Firebase Cloud Messaging)
const axios = require('axios');
const { FCM_SERVER_KEY } = require('../config/env');
const logger = require('../config/logger');

/**
 * Send push notification
 * @param {string} to - device token
 * @param {object} payload - notification payload
 */
const sendPush = async (to, payload) => {
  try {
    const res = await axios.post('https://fcm.googleapis.com/fcm/send', {
      to,
      notification: payload,
    }, {
      headers: {
        Authorization: `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    logger.info(`Push notification sent to ${to} ✅`);
    return res.data;
  } catch (err) {
    logger.error(`Failed to send push notification to ${to} ❌`, err);
    throw err;
  }
};

module.exports = { sendPush };
