const Conversation = require("../models/Conversation.model")
const Message = require("../models/Message.model")

module.exports.markAsReadMessageAndConversation = async (conversationId, userId) => {
  await Conversation.findByIdAndUpdate(conversationId, {
    $pull: { unreadBy: userId.toString() }
  })
  await Message.updateMany(
    { conversationId, senderId: { $ne: userId }, seenBy: { $ne: userId } },
    { $addToSet: { seenBy: userId } }
  );
}