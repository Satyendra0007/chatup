module.exports = (io, socket, onlineUsers) => {
  socket.on("setup", (userId) => {
    socket.join(`user:${userId}`);
    
    // Attach userId to socket for easy lookup on disconnect
    socket.userId = userId;
    
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      const userSockets = onlineUsers.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
        }
      }
      io.emit("online-users", Array.from(onlineUsers.keys()));
    } else {
      // Fallback for sockets that somehow got in without setting socket.userId
      for (let [userId, sockets] of onlineUsers.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(userId);
          }
          io.emit("online-users", Array.from(onlineUsers.keys()));
          break;
        }
      }
    }
  });
};
