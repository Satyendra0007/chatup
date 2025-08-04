const router = require("express").Router();
const messageController = require("../controllers/message.controllers")
const { param, body } = require("express-validator")
const { requireAuth } = require("@clerk/express")

router.route("/get/:conversationId").get(
  requireAuth(),
  param("conversationId")
    .notEmpty().withMessage("conversatio id should not be empty")
    .isMongoId().withMessage("conversatio id must be a mongodb id"),
  messageController.getMessages
)

router.route("/send").post(
  requireAuth(),
  body("conversationId")
    .notEmpty().withMessage("conversation id should not be empty")
    .isMongoId().withMessage("conversatio id must be a mongodb id"),
  body("text")
    .notEmpty().withMessage("text shuld not be empty")
    .isString().withMessage("text must be a string")
    .trim(),
  messageController.sendMessage
)


module.exports = router