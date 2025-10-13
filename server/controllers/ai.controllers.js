const { GoogleGenAI } = require("@google/genai")
const { validationResult, matchedData } = require("express-validator")
const AiChat = require("../models/AiChat.model")
const { getAuth } = require("@clerk/express")

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY })

module.exports.getResponse = async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ error: result.array() })
  }
  try {
    const { userId } = getAuth(req)
    const { prompt } = matchedData(req)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    const newChat = await AiChat.create({ userId, prompt, response: response.text })
    res.status(200).json(newChat)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

module.exports.getPreviousResponse = async (req, res) => {
  try {
    const { userId } = getAuth(req)
    const previousResponse = await AiChat.find({ userId })
    res.status(200).json(previousResponse)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

module.exports.deleteResponse = async (req, res) => {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ error: result.array() })
  }
  try {
    const { responseId } = matchedData(req)
    await AiChat.deleteOne({ _id: responseId })
    res.status(200).json({ message: "Response Deleted !" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: " Internal Server Error" })
  }
}