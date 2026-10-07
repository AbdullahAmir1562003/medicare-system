const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
    // Normalize decoded token payload
    req.user = decoded.user || decoded;
    if (!req.user.id && req.user._id) {
      req.user.id = req.user._id;
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};