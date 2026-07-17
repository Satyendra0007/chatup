const presenceSocket = require("./presence.socket");
const conversationSocket = require("./conversation.socket");
const messageSocket = require("./message.socket");

const onlineUsers = new Map();

module.exports.setupSockets = (io) => {
  io.on('connection', (socket) => {
    console.log('user connected ' + socket.id);

    presenceSocket(io, socket, onlineUsers);
    conversationSocket(io, socket);
    messageSocket(io, socket);
  });
};
