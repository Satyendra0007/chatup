const Message = require("../models/Message.model");
const Conversation = require("../models/Conversation.model")
const { validationResult, matchedData } = require("express-validator")
const { getAuth } = require('@clerk/express');
const { getIO } = require("../utils/socket")
const { markAsReadMessageAndConversation } = require("../services/message.services")

module.exports.getMessages = async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ message: result.array() })
  }
  try {
    const { conversationId } = matchedData(req)
    const messages = await Message.find({ conversationId })
    res.status(200).json(messages)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error " })
  }
}

module.exports.sendMessage = async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ message: result.array() })
  }
  try {
    const { userId } = getAuth(req);
    const data = matchedData(req)
    let newMessage = await Message.create({ ...data, senderId: userId })
    const currentConversation = await Conversation.findById(data.conversationId)
    const otherUsers = currentConversation.members.filter(id => id !== userId)
    const conversation = await Conversation.findByIdAndUpdate(data.conversationId, {
      lastMessage: newMessage._id,
      $addToSet: { unreadBy: { $each: otherUsers } }
    }, { new: true })

    const io = getIO()
    conversation.members.forEach((member) => {
      io.to(`user:${member}`).emit("update-conversation", {
        conversationId: conversation._id,
        lastMessage: newMessage,
        unreadBy: conversation.unreadBy
      })
    })
    io.to(`conversation:${conversation._id}`).emit("stop-typing", conversation._id);
    io.to(`conversation:${conversation._id}`).emit("new-message", { message: newMessage })
    res.status(200).json({ newMessage, conversation });
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ message: "Inatenal Server Error " })
  }
}

module.exports.markAsRead = async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ error: result.array() })
  }
  try {
    const { conversationId } = matchedData(req)
    const { userId } = getAuth(req)
    await markAsReadMessageAndConversation(conversationId, userId);
    res.status(200).json({ message: "marked as read" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

module.exports.addReaction = async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ message: result.array });
  }
  try {
    const { messageId, reaction } = matchedData(req)
    const updatedMessage = await Message.findByIdAndUpdate(messageId, { reaction }, { new: true })
    const io = getIO()
    io.to(`conversation:${updatedMessage.conversationId}`).emit("update-reaction", updatedMessage)
    res.status(200).json({ message: "reacted ! ", updatedMessage })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error " })
  }
}

module.exports.deleteMessage = async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ message: result.array() })
  }
  try {
    const { messageId } = matchedData(req)
    // const message = await Message.findOne({ _id: messageId })
    const deletedMessage = await Message.findByIdAndDelete(messageId)
    if (!deletedMessage) {
      return res.status(404).json({ message: "Message not found" })
    }
    const conversation = await Conversation.findById(deletedMessage.conversationId)
    if (conversation?.lastMessage?.toString() === deletedMessage?._id?.toString()) {
      const prevMessage = await Message.findOne({ conversationId: deletedMessage.conversationId })
        .sort({ createdAt: -1 })
      conversation.lastMessage = prevMessage?._id || null;
      await conversation.save()
    }
    const io = getIO()
    io.to(`conversation:${deletedMessage.conversationId}`).emit("delete-message", deletedMessage)
    res.status(200).json({ deletedMessage })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error " })
  }
}

module.exports.editMessage = async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ message: result.array() })
  }
  try {
    const { messageId, editedText } = matchedData(req)
    // const message = await Message.updateOne({ _id: messageId }, { $set: { text: editedText } })
    const message = await Message.findByIdAndUpdate(messageId, { text: editedText }, { new: true })
    const io = getIO()
    io.to(`conversation:${message.conversationId}`).emit("edit-message", message)
    res.status(200).json({ message });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}