const mongoose = require("mongoose")

module.exports.connectDB = () => {
  return mongoose.connect(process.env.MONGODB_URL)
}