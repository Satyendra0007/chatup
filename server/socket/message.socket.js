const { markAsReadMessageAndConversation } = require("../services/message.services");

module.exports = (io, socket) => {
  socket.on('typing', (payload) => {
    io.to(`conversation:${payload.conversationId}`).emit('typing', payload);
  });

  socket.on('stop-typing', (payload) => {
    io.to(`conversation:${payload}`).emit('stop-typing', payload);
  });

  socket.on('seen-message', async (payload) => {
    try {
      await markAsReadMessageAndConversation(payload.conversationId, payload.userId);
      io.to(`conversation:${payload.conversationId}`).emit('seen-message', payload);
    } catch (error) {
      console.error("Error in seen-message socket event:", error);
    }
  });
};
