const Message = require("../models/Message.model");
const Conversation = require("../models/Conversation.model")
const { validationResult, matchedData } = require("express-validator")
const { getAuth } = require('@clerk/express');

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
    res.status(200).json({ newMessage, conversation });
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ message: "Inatenal Server Error " })
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
    const message = await Message.findOne({ _id: messageId })
    await Message.deleteOne({ _id: messageId })
    res.status(200).json({ message })
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
    const message = await Message.updateOne({ _id: messageId }, { $set: { text: editedText } })
    res.status(200).json({ message: "message edited" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}