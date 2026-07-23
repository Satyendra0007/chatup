module.exports = (io, socket, onlineUsers) => {
  // Utility to send to all sockets of a specific user
  const emitToUser = (userId, event, payload) => {
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      for (const socketId of userSockets) {
        io.to(socketId).emit(event, payload);
      }
    }
  };

  // 1. Initiate Call
  socket.on("call-request", (payload) => {
    // payload: { callId, sessionId, messageId, timestamp, callerId, receiverId, callType, callerName, callerAvatar }
    // We append the socketId of the caller so the receiver can lock onto it if needed
    emitToUser(payload.receiverId, "call-request", { ...payload, callerSocketId: socket.id });
  });

  // 2. Call Response (Accept / Reject / Busy)
  socket.on("call-response", (payload) => {
    // payload: { callId, sessionId, messageId, timestamp, callerId, receiverId, status, responderSocketId }
    emitToUser(payload.callerId, "call-response", payload);
  });

  // 3. WebRTC Perfect Negotiation Signaling (SDP Offer/Answer)
  socket.on("call-sdp", (payload) => {
    // payload: { callId, sessionId, messageId, timestamp, senderId, receiverId, description }
    emitToUser(payload.receiverId, "call-sdp", payload);
  });

  // 4. WebRTC ICE Candidates
  socket.on("call-ice", (payload) => {
    // payload: { callId, sessionId, messageId, timestamp, senderId, receiverId, candidate }
    emitToUser(payload.receiverId, "call-ice", payload);
  });

  // 5. Call Termination
  socket.on("call-end", (payload) => {
    // payload: { callId, sessionId, messageId, timestamp, senderId, receiverId, reason }
    emitToUser(payload.receiverId, "call-end", payload);
  });
};
