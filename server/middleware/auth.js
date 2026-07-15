const jwt = require('jsonwebtoken');
const db = require('../db');
const JWT_SECRET = process.env.JWT_SECRET || 'sakura_secret_key_1337';

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token, access denied.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;

    // Fetch user relationship details
    const user = await db.users.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found, auth failed.' });
    }
    
    req.user = user;
    req.relationshipId = user.relationshipId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token, authorization failed.' });
  }
};
