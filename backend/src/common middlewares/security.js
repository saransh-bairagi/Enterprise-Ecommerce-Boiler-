// src/middlewares/security.js
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Security middleware for express
const securityMiddleware = (app) => {
  // Prevent NoSQL injection
  app.use(mongoSanitize());

  // Prevent XSS attacks
  app.use(xss());

  // Prevent HTTP parameter pollution
  app.use(hpp());
};

module.exports = securityMiddleware;
