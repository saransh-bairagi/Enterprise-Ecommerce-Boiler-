try {
  const http = require('http');
  const initExpress = require('./loaders/express');
  const connectDB = require('./config/db');
  const logger = require('./config/logger');
  const schedulerManager = require('./jobs/scheduler');
  const schedulerConfig = require('./config/scheduler.config');

  const PORT = process.env.PORT || 5000;

  // ═════════════════════════════════════════════════════════════════════════════
  // INITIALIZE EXPRESS APP
  // ═════════════════════════════════════════════════════════════════════════════
  const app = initExpress();

  // ═════════════════════════════════════════════════════════════════════════════
  // CREATE HTTP SERVER
  // ═════════════════════════════════════════════════════════════════════════════
  const server = http.createServer(app);

  // ═════════════════════════════════════════════════════════════════════════════
  // CONNECT MONGODB
  // ═════════════════════════════════════════════════════════════════════════════
  connectDB();

  // ═════════════════════════════════════════════════════════════════════════════
  // INITIALIZE SCHEDULERS
  // ═════════════════════════════════════════════════════════════════════════════
  if (schedulerConfig.enabled) {
    try {
      logger.info(
        '[Server] Initializing schedulers...'
      );
      schedulerManager.initialize();
      logger.info(
        '[Server] ✅ Schedulers initialized successfully'
      );
    } catch (error) {
      logger.error(
        '[Server] Failed to initialize schedulers:',
        error
      );
      // Continue startup even if scheduler fails
    }
  } else {
    logger.warn('[Server] Schedulers are disabled');
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // GRACEFUL SHUTDOWN
  // ═════════════════════════════════════════════════════════════════════════════
  const gracefulShutdown = async (signal) => {
    logger.info(`[Server] Received ${signal}, starting graceful shutdown...`);

    // Stop schedulers
    try {
      schedulerManager.stopAll();
      logger.info('[Server] ✅ All schedulers stopped');
    } catch (error) {
      logger.error('[Server] Error stopping schedulers:', error);
    }

    // Close server
    server.close(() => {
      logger.info('[Server] ✅ HTTP server closed');
      process.exit(0);
    });

    // Force exit after timeout
    setTimeout(() => {
      logger.error('[Server] ❌ Forced shutdown after 10 seconds');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    logger.error('[Server] Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error(
      '[Server] Unhandled Rejection at:',
      promise,
      'reason:',
      reason
    );
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // START SERVER
  // ═════════════════════════════════════════════════════════════════════════════
  server.listen(PORT, () => {
    logger.info(
      `╔════════════════════════════════════════════════════════════════╗`
    );
    logger.info(
      `║                    SERVER STARTED                              ║`
    );
    logger.info(
      `║  Port: ${String(PORT).padEnd(56)} ║`
    );
    logger.info(
      `║  Environment: ${String(process.env.NODE_ENV || 'development').padEnd(48)} ║`
    );
    logger.info(
      `║  Schedulers: ${String(schedulerConfig.enabled ? 'ENABLED' : 'DISABLED').padEnd(50)} ║`
    );
    logger.info(
      `╚════════════════════════════════════════════════════════════════╝`
    );
  });
} catch (error) {
  console.error('[Server] Failed to start server:', error);
  process.exit(1);
}
