const Conversation = require("../models/Conversation.model")
const { matchedData, validationResult } = require("express-validator")
const { getUserById } = require("../utils/clerk")
const { getAuth } = require('@clerk/express');
const Message = require("../models/Message.model");
const { decryptMessage } = require("../utils/crypto");

const isConversationExists = async (members) => {
  if (members.length !== 2) return false;
  const conversation = await Conversation.findOne({
    members: { $all: members, $size: 2 },
    isGroup: false
  })
  return !!conversation;
}

module.exports.createConversation = async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ error: result.array() })
  }
  try {
    const data = matchedData(req)
    const conversation = await isConversationExists(data.members)
    if (!conversation) {
      await Conversation.create(data)
      res.status(201).json({ message: "Conversation Created !" })
    }
    else {
      res.status(400).json({ message: "conversation already exists" })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error !" })
  }
}

module.exports.getConversations = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    // const conversations = await Conversation.find({
    //   members: { $in: [userId] }
    // }).populate("lastMessage").sort({ updatedAt: -1 });


    const conversations = await Conversation.aggregate([
      {
        $match: {
          members: { $in: [userId] }
        }
      },
      {
        $lookup: {
          from: "messages",
          localField: "lastMessage",
          foreignField: "_id",
          as: "lastMessage"
        }
      },
      {
        $unwind: {
          path: "$lastMessage",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          "lastMessage.updatedAt": -1
        }
      }
    ]);


    const response = await Promise.all(conversations.map(async (conversation) => {
      const { _id, isGroup, members, name, lastMessage, groupAdmin, unreadBy } = conversation;
      const decryptedLastMessage = lastMessage
        ? { ...lastMessage, text: decryptMessage(lastMessage.text) }
        : null;
      if (!isGroup) {
        const receiver = members.find(id => id !== userId)
        const user = await getUserById(receiver);
        // if (!user) {
        //   return {
        //     conversationId: _id,
        //     isGroup,
        //     receiverId: null,
        //     name: "undefined",
        //     imageUrl: null,
        //     email: null,
        //     lastMessage: decryptedLastMessage,
        //     unreadBy
        //   }
        // }
        const { id, firstName, imageUrl, emailAddresses } = user;
        return {
          conversationId: _id,
          isGroup,
          receiverId: id,
          name: firstName,
          imageUrl,
          email: emailAddresses[0].emailAddress,
          lastMessage: decryptedLastMessage,
          unreadBy

        }
      }
      //for group chats
      const membersDetails = await Promise.all(members.map(async (member) => {
        const user = await getUserById(member);
        // if (!user) {
        //   return {
        //     id: null,
        //     firstName: "",
        //     imageUrl: null,
        //     email: null
        //   }
        // }
        const { id, firstName, imageUrl, emailAddresses } = user;
        return {
          id: id,
          firstName,
          imageUrl,
          email: emailAddresses[0].emailAddress
        }
      }))
      return {
        conversationId: _id,
        isGroup,
        name,
        groupAdmin,
        members: membersDetails,
        lastMessage: decryptedLastMessage,
        unreadBy
      }
    }))
    return res.status(200).json({ conversations: response });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error" })
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
    await Conversation.findByIdAndUpdate(conversationId, {
      $pull: { unreadBy: userId.toString() }
    })
    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );
    res.status(200).json({ message: "marked as read" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

