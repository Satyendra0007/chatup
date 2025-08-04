const router = require("express").Router()
const userController = require("../controllers/user.controllers")
const { query } = require("express-validator")
const authenticateUser = require("../middleware/authenticateUser")

router.route("/").get(
  authenticateUser,
  userController.getAllUsers
)

router.route("/search").get(
  authenticateUser,
  query("email").notEmpty().isEmail().escape(),
  userController.getUser
)

module.exports = router