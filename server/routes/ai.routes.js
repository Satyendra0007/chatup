const authenticateUser = require("../middleware/authenticateUser")
const { body } = require("express-validator")
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

module.exports = router