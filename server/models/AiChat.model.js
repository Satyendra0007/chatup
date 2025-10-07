const mongoose = require("mongoose")

const aiChatSchema = new mongoose.Schema({
  userId: {
    required: true,
    type: String
  },
  prompt: {
    required: true,
    type: String
  },
  response: {
    required: true,
    type: String
  },
},
  { timeStamps: true }
)

const AiChat = mongoose.models.AiChat || mongoose.model("AiChat", aiChatSchema)
module.exports = AiChat