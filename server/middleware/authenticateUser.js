const { getAuth } = require('@clerk/express');

const authenticateUser = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = userId;
  next();
}

module.exports = authenticateUser;













