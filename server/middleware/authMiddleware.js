const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'traveloop_secret';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.id || decoded.userId || decoded._id;
      
      req.user = await User.findById(userId).select('-password');
      if (!req.user) {
        console.error('[AUTH MIDDLEWARE FAIL] User not found for ID:', userId);
        return res.status(401).json({ message: 'User not found' });
      }
      return next();
    } catch (error) {
      console.error('[AUTH MIDDLEWARE ERROR]', error.name, error.message);
      return res.status(401).json({ message: `Not authorized: ${error.message}` });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
