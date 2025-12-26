// src/sockets/order.socket.js
const { getIO } = require('../config/socket');
const logger = require('../config/logger');

/**
 * Initialize order-related socket events
 */
const orderSocket = () => {
  const io = getIO();

  io.of('/orders').on('connection', (socket) => {
    logger.info(`Client connected to /orders namespace: ${socket.id}`);

    // Subscribe to a specific order
    socket.on('subscribeOrder', (orderId) => {
      socket.join(`order_${orderId}`);
      logger.info(`Client ${socket.id} subscribed to order ${orderId}`);
      socket.emit('subscribed', { orderId });
    });

    // Unsubscribe from a specific order
    socket.on('unsubscribeOrder', (orderId) => {
      socket.leave(`order_${orderId}`);
      logger.info(`Client ${socket.id} unsubscribed from order ${orderId}`);
      socket.emit('unsubscribed', { orderId });
    });

    // Broadcast order updates (server-side)
    socket.on('orderUpdate', ({ orderId, status }) => {
      io.of('/orders').to(`order_${orderId}`).emit('orderUpdate', { orderId, status, timestamp: new Date() });
      logger.info(`Order ${orderId} updated to status ${status}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`Client disconnected from /orders: ${socket.id}`);
    });
  });
};

module.exports = orderSocket;
