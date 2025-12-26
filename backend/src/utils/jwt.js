// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const logger = require('../config/logger');

/**
 * Generate JWT token
 * @param {object} payload
 * @param {string} [expiresIn]
 * @returns {string} token
 */
const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    logger.error('JWT verification failed ❌', err);
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode JWT token without verifying
 * @param {string} token
 * @returns {object} decoded payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (err) {
    logger.error('JWT decode failed ❌', err);
    return null;
  }
};

module.exports = { generateToken, verifyToken, decodeToken };
