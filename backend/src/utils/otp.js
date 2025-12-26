// src/utils/otp.js
const crypto = require('crypto');
const { hashPassword, comparePassword } = require('./bcrypt');
const logger = require('../config/logger');

const OTP_LENGTH = 6;
const OTP_EXPIRATION_MIN = 10; // OTP valid for 10 minutes

/**
 * Generate numeric OTP
 * @returns {string} OTP
 */
const generateOTP = () => {
  let otp = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

/**
 * Hash OTP for secure storage
 * @param {string} otp
 * @returns {Promise<string>}
 */
const hashOTP = async (otp) => {
  return await hashPassword(otp);
};

/**
 * Verify OTP against hashed value
 * @param {string} otp
 * @param {string} hashedOTP
 * @returns {Promise<boolean>}
 */
const verifyOTP = async (otp, hashedOTP) => {
  return await comparePassword(otp, hashedOTP);
};

/**
 * Generate OTP with hashed value and expiration timestamp
 * @returns {Promise<{otp: string, hashedOTP: string, expiresAt: Date}>}
 */
const generateOTPWithExpiry = async () => {
  const otp = generateOTP();
  const hashedOTP = await hashOTP(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MIN * 60000); // 10 min
  return { otp, hashedOTP, expiresAt };
};

module.exports = { generateOTP, hashOTP, verifyOTP, generateOTPWithExpiry };
