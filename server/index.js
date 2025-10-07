require("dotenv").config()
const express = require("express");
const { createServer } = require("http")
const consversationRouter = require("./routes/conversation.routes")
const userRouter = require("./routes/user.routes")
const { connectDB } = require("./utils/db")
const cors = require("cors")
const { clerkMiddleware } = require('@clerk/express');
const messageRouter = require("./routes/message.routes")
const aiRouter = require("./routes/ai.routes")
const { Server } = require("socket.io")

const PORT = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
})

app.use(clerkMiddleware());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json())
app.use("/api/user", userRouter)
app.use("/api/conversation", consversationRouter)
app.use("/api/message", messageRouter)
app.use("/api/ai", aiRouter)

app.get("/", (req, res) => {
  res.status(200).send("Hello World !")
})

const onlineUsers = new Map();
io.on('connection', (socket) => {
  console.log('user connected ' + socket.id)

  socket.on("setup", (userId) => {
    socket.join(userId)
    onlineUsers.set(userId, socket.id)
    io.emit('online-users', Array.from(onlineUsers.keys()));
  })

  socket.on("join-room", (conversationId) => {
    socket.join(conversationId)
  })

  socket.on('send-message', (payload) => {
    const members = payload?.conversation?.members
    if (!members) {
      return console.log("user not found");
    }
    members.forEach(member => {
      if (member === payload.newMessage.senderId) return;
      io.to(member).emit('recieve-message', payload.newMessage)
    });
  })

  socket.on('typing', (payload) => {
    io.to(payload.conversationId).emit('typing', payload)
  })

  socket.on('stop-typing', (conversationId) => {
    io.to(conversationId).emit('stop-typing', conversationId)
  })

  socket.on('seen-message', (payload) => {
    io.to(payload.conversationId).emit('seen-message', payload)
  })

  socket.on("message-reaction", (payload) => {
    io.to(payload.conversationId).emit("update-reaction", payload)
  })

  socket.on("delete-message", (payload) => {
    io.to(payload.conversationId).emit("delete-message", payload)
  })

  socket.on("edit-message", (payload) => {
    io.to(payload.conversationId).emit("edit-message", payload)
  })

  socket.on('disconnect', () => {
    console.log("user disconnected")
    for (let [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId)
        break;
      }
    }
    io.emit("online-users", Array.from(onlineUsers.keys()))
  })
})

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server is Running ... ")
  })
}).catch((e) => {
  console.log("Failed to Connect With DB  ")
  console.log(e)
})
