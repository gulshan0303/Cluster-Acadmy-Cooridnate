const jwt = require('jsonwebtoken');
const User = require('../model/user');
const getTokenFromHeaders = (req) => {
  const authHeader = req.headers.authorization;
  return authHeader && authHeader.split(' ')[1];
};

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = getTokenFromHeaders(req);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.secertKey); // Ensure the environment variable is properly named
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Middleware to check if the user is an admin
const isAdmin = async (req, res, next) => {
  const token = getTokenFromHeaders(req);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Use the same key for consistency
    const user = await User.findById(decoded.user);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access only' });
    }

    req.user = user; 
    next();
  } catch (error) {
    console.error('Admin authorization failed:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token or access' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};



module.exports = {verifyToken,isAdmin}
