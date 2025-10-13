const authenticateUser = require("../middleware/authenticateUser")
const { body, param } = require("express-validator")
const aiController = require("../controllers/ai.controllers")

const router = require("express").Router()

router.route("/").post(
  authenticateUser,
  body("prompt")
    .notEmpty().withMessage("prompt Should not empty")
    .isString().withMessage("prompt must be string "),
  aiController.getResponse
)

router.route("/").get(
  authenticateUser,
  aiController.getPreviousResponse
)

router.route("/:responseId").delete(
  authenticateUser,
  param("responseId")
    .notEmpty().withMessage("ResponseId should not empty ")
    .isMongoId().withMessage("responseId must be mongodb id "),
  aiController.deleteResponse
)

module.exports = router