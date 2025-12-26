// src/utils/uuid.js
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a standard UUID v4
 * @returns {string} UUID
 */
const generateUUID = () => uuidv4();

/**
 * Generate a prefixed UUID (e.g., USER-xxxx-xxxx)
 * @param {string} prefix
 * @returns {string}
 */
const generatePrefixedUUID = (prefix = '') => {
  const id = uuidv4();
  return prefix ? `${prefix}-${id}` : id;
};

module.exports = { generateUUID, generatePrefixedUUID };
