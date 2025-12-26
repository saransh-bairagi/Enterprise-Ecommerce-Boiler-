// src/config/logger.js
const winston = require('winston');
const path = require('path');

const logDir = path.resolve(process.cwd(), 'logs');

// Custom filter for 500-level errors
const serverErrorFilter = winston.format((info) => {
  if (info.statusCode && info.statusCode >= 500 && info.statusCode < 600) {
    return info;
  }
  return false; // ignore other logs
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      (info) => `[${info.timestamp}] ${info.level.toUpperCase()} (${info.statusCode || 0}): ${info.message}`
    )
  ),
  transports: [
    // Console
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // File for ALL logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),

    // File for errors (4xx and 5xx)
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),

    // ⭐ File only for 500 errors
    new winston.transports.File({
      filename: path.join(logDir, '500-errors.log'),
      level: 'error',
      format: winston.format.combine(serverErrorFilter()),
    }),
  ],

  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') }),
  ],

  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'rejections.log') }),
  ],
});

// Optional stream for morgan
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
