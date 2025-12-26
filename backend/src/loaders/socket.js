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

    // Example: Notify client when order status changes
    socket.on('subscribeOrder', (orderId) => {
      socket.join(`order_${orderId}`);
      logger.info(`Client ${socket.id} subscribed to order ${orderId}`);
    });

    socket.on('unsubscribeOrder', (orderId) => {
      socket.leave(`order_${orderId}`);
      logger.info(`Client ${socket.id} unsubscribed from order ${orderId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected from /orders: ${socket.id}`);
    });
  });
};

module.exports = orderSocket;
