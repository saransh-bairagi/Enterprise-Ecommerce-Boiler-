// src/loaders/mongoose.js
const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('../config/env');
const logger = require('../config/logger');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false); // optional
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB connected ✅ [${NODE_ENV}]`);
  } catch (err) {
    logger.error('MongoDB connection failed ❌', err);
    process.exit(1); // exit process if DB connection fails
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected! Reconnecting...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected ✅');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error ❌', err);
  });
};

module.exports = connectDB;
