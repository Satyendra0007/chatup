const mongoose = require("mongoose")
const conversationSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  members: {
    type: [String],
    require: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    require: true
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupAdmin: {
    type: String,
  },
  unreadBy: {
    type: [String],
    default: [],
  }
},
  {
    timestamps: true
  }
)

const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema)
module.exports = Conversation