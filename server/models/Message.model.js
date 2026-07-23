const mongoose = require("mongoose")
const { decryptMessage, encryptMessage } = require("../utils/crypto");

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    set: (plainText) => encryptMessage(plainText),   // encrypt before save
    get: (cipherText) => decryptMessage(cipherText)  // decrypt when reading
  },
  reaction: {
    type: String
  },
  seenBy: {
    type: [String],
    default: []
  },
  tempId: {
    type: String,
    index: true
  },
  time: {
    type: Number,
    default: () => Date.now()
  },
  replyTo: {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    senderId:  { type: String, default: null },
    text:      { type: String, default: null }  // plain-text snapshot for preview
  }
},
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
)

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema)
module.exports = Message