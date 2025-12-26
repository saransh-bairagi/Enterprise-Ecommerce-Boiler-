// src/loaders/express.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const setupSwagger = require('../config/swagger');
const errorHandler = require('../common middlewares/errorHandler');
const routes = require('../routes/parent.js');
const insideRouteSecretAttached =
    require("../common middlewares/insideRouteSecretAttached").insideRouteSecretAttached;
const initExpress = () => {
  const app = express();

  // Global middlewares
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/', insideRouteSecretAttached);
  // Mount API routes
  app.use('/api/v1', routes);

  // Swagger docs
  setupSwagger(app);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};

module.exports = initExpress;
