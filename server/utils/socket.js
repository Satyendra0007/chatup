const { Server } = require("socket.io")

let io;
module.exports.initializeIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  })
  return io;
}

module.exports.getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized ")
  }
  return io;
}