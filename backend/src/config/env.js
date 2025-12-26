// src/config/env.js
const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

// Export environment variables with defaults
module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
  JWT_SECRET: process.env.JWT_SECRET || 'fsdfsdfdddddddgdgdfg@##@IGGULUH#@*()#FJFSDKJFsdjkf@&#)$&#@)(AF:ALJF#@$:L"L#@+#+$',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: process.env.EMAIL_PORT || '',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'defaultaccesstokensecret',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'defaultrefreshtokensecret',


  // Payments
   RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET
};
