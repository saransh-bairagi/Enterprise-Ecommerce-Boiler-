// src/sockets/chat.socket.js
const { getIO } = require('../config/socket');
const logger = require('../config/logger');

/**
 * Initialize chat-related socket events
 */
const chatSocket = () => {
  const io = getIO();

  io.of('/chat').on('connection', (socket) => {
    logger.info(`Client connected to /chat namespace: ${socket.id}`);

    // Join chat room
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      logger.info(`Client ${socket.id} joined room ${roomId}`);
      socket.emit('joinedRoom', { roomId });
    });

    // Leave chat room
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      logger.info(`Client ${socket.id} left room ${roomId}`);
      socket.emit('leftRoom', { roomId });
    });

    // Send chat message
    socket.on('chatMessage', ({ roomId, message, sender }) => {
      io.of('/chat').to(roomId).emit('chatMessage', {
        roomId,
        message,
        sender,
        timestamp: new Date(),
      });
      logger.info(`Message from ${sender} sent to room ${roomId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`Client disconnected from /chat: ${socket.id}`);
    });
  });
};

module.exports = chatSocket;
