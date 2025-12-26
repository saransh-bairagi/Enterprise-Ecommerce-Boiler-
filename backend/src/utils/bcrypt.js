// src/utils/bcrypt.js
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12; // enterprise-level hashing

/**
 * Hash a plain text password
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  } catch (err) {
    throw new Error('Password hashing failed');
  }
};

/**
 * Compare plain password with hashed password
 * @param {string} password
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (err) {
    throw new Error('Password comparison failed');
  }
};

module.exports = { hashPassword, comparePassword };
