// src/utils/date.js
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const DEFAULT_TZ = 'Asia/Kolkata';

/**
 * Get current date in ISO format
 * @param {string} tz
 * @returns {string}
 */
const now = (tz = DEFAULT_TZ) => dayjs().tz(tz).toISOString();

/**
 * Format date
 * @param {Date|string} date
 * @param {string} format
 * @param {string} tz
 * @returns {string}
 */
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss', tz = DEFAULT_TZ) =>
  dayjs(date).tz(tz).format(format);

/**
 * Check if date is in range
 * @param {Date|string} date
 * @param {Date|string} start
 * @param {Date|string} end
 * @returns {boolean}
 */
const isInRange = (date, start, end) =>
  dayjs(date).isSameOrAfter(dayjs(start)) && dayjs(date).isSameOrBefore(dayjs(end));

/**
 * Convert to UTC
 * @param {Date|string} date
 * @returns {string}
 */
const toUTC = (date) => dayjs(date).utc().toISOString();

/**
 * Convert from UTC to local timezone
 * @param {Date|string} date
 * @param {string} tz
 * @returns {string}
 */
const fromUTC = (date, tz = DEFAULT_TZ) => dayjs(date).tz(tz).toISOString();

module.exports = { now, formatDate, isInRange, toUTC, fromUTC };
