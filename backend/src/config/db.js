// src/config/db.js
const mongoose = require('mongoose');
const logger = require('./logger'); // assuming you have a logger.js

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('MongoDB connected successfully ✅');
    console.log('MongoDB connected successfully ✅');
  } catch (err) {
    logger.error('MongoDB connection error ❌', err);
    console.error('MongoDB connection error ❌', err);

    // Retry after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Listen for disconnected events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected! Retrying...');
  console.log('MongoDB disconnected! Retrying...');
  connectDB();
});

module.exports = connectDB;
