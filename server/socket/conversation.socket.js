module.exports = (io, socket) => {
  socket.on("join-room", (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on("leave-room", (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });
};
