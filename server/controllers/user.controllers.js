const { getUserByEmail, getUsers } = require("../utils/clerk")
const { validationResult, matchedData } = require("express-validator")

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error ! " })
    console.log(error)
  }
}

module.exports.getUser = async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ error: result.array() })
  }
  try {
    const { email } = matchedData(req);
    const { data, totalCount } = await getUserByEmail(email)
    if (totalCount === 0) {
      return res.status(404).json({ message: "User Not Found " })
    }
    const { id, firstName, lastName, imageUrl, emailAddresses } = data[0];
    res.status(200).json({
      id,
      firstName,
      lastName,
      imageUrl,
      email: emailAddresses[0]?.emailAddress
    })
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error ! " })
    console.log(error)
  }
}

