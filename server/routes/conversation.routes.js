const router = require("express").Router()
const conversationController = require("../controllers/conversation.controllers")
const { body } = require("express-validator")
const authenticateUser = require("../middleware/authenticateUser")

router.route('/').get(
  authenticateUser,
  conversationController.getConversations
)

router.route("/create").post(
  authenticateUser,
  body("name")
    .if((value, { req }) => req.body.isGroup)
    .notEmpty().withMessage("Group chat name is required")
    .isString().withMessage("Name must be a String"),
  body("members")
    .isArray().withMessage("members should be an array")
    .custom((members, { req }) => {
      if (req.body.isGroup && members.length < 3) {
        throw new Error("groupchat must have atleast three members")
      }

      if (!req.body.isGroup && members.length !== 2) {
        throw new Error("converstion must have two members ")
      }
      return true
    }),
  body("members.*")
    .isString().withMessage("Members must be string"),
  body("lastMessage")
    .optional()
    .isMongoId().withMessage("Last message must be a mongodb id"),
  body("isGroup")
    .optional()
    .isBoolean().withMessage("isGroup must be boolean"),
  body("groupAdmin")
    .if((value, { req }) => req.body.isGroup)
    .notEmpty().withMessage("Group admin is required for group chat")
    .isString().withMessage("Group admin must be a string"),
  conversationController.createConversation
)

router.route("/markread").post(
  authenticateUser,
  body('conversationId')
    .notEmpty().withMessage("conversation id can't be empty ")
    .isMongoId().withMessage("conversation id must be a mongodb id"),
  conversationController.markAsRead
)


module.exports = router