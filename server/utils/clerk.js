const { clerkClient } = require("@clerk/express")

module.exports.clerkClient = clerkClient

module.exports.getUsers = async () => {
  try {
    return await clerkClient.users.getUserList();
  } catch (error) {
    return null
  }
}

module.exports.getUserByEmail = async (email) => {
  try {
    return await clerkClient.users.getUserList({ emailAddress: email })
  } catch (error) {
    return null
  }
}

module.exports.getUserById = async (userId) => {
  try {
    return await clerkClient.users.getUser(userId)
  } catch (error) {
    return null
  }
}