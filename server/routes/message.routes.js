const router = require("express").Router();
const messageController = require("../controllers/message.controllers")
const { param, body } = require("express-validator")
const authenticateUser = require("../middleware/authenticateUser");

router.route("/get/:conversationId").get(
  authenticateUser,
  param("conversationId")
    .notEmpty().withMessage("conversation id should not be empty")
    .isMongoId().withMessage("conversation id must be a mongodb id"),
  messageController.getMessages
)

router.route("/send").post(
  authenticateUser,
  body("conversationId")
    .notEmpty().withMessage("conversation id should not be empty")
    .isMongoId().withMessage("conversatio id must be a mongodb id"),
  body("text")
    .notEmpty().withMessage("text should not be empty")
    .isString().withMessage("text must be a string")
    .trim(),
  messageController.sendMessage
)

router.route("/react/:messageId").put(
  authenticateUser,
  param("messageId")
    .notEmpty().withMessage("message Id can't be Empty ")
    .isMongoId().withMessage("message Id must be a mongodb id"),
  body("reaction")
    .isString().withMessage("reaction  must be a string"),
  messageController.addReaction
)

router.route("/delete/:messageId").delete(
  authenticateUser,
  param("messageId")
    .notEmpty().withMessage("Message Id can't be Empty ")
    .isMongoId().withMessage("Message Id must be a mongodb id"),
  messageController.deleteMessage
)

router.route("/edit/:messageId").put(
  authenticateUser,
  param("messageId")
    .notEmpty().withMessage("Message Id con't be Empty ")
    .isMongoId().withMessage("Message Id must be a mongodb id"),
  body("editedText")
    .notEmpty().withMessage("text can't be empty ")
    .isString().withMessage("text should be string "),
  messageController.editMessage
)


module.exports = router