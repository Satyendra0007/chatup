const Message = require("../models/Message.model");
const Conversation = require("../models/Conversation.model")
const { validationResult, matchedData } = require("express-validator")
const { getAuth, requireAuth } = require('@clerk/express');
const { decryptMessage } = require("../utils/crypto")

module.exports.getMessages = async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ message: result.array() })
  }
  try {
    const { conversationId } = matchedData(req)
    const messages = await Message.find({ conversationId })
    // const messages = rowMessages.map(message => ({ ...message, text: decryptMessage(message.text) }))
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
