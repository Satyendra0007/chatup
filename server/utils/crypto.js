const CryptoJS = require("crypto-js")

module.exports.decryptMessage = (encrypted) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, process.env.SECRET_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    return encrypted
  }
}

module.exports.encryptMessage = (plainText) => {
  return CryptoJS.AES.encrypt(plainText, process.env.SECRET_KEY).toString()
}
