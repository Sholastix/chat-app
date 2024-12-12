require('dotenv').config();
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

// Basically here we creating custom authorization middleware.
module.exports.authMdw = async (req, res, next) => {
  // Get the token (if it exists) from the header.
  const token = req.header('Authorization');

  // Check token availability.
  if (!token) {
    return res.status(401).json({ msg: 'Token not provided, authorization denied!' });
  };

  // Verify token.
  try {
    const decoded = jwt.verify(token, jwtSecret);
    // With this we can access to our user's ID in all protected routes.
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token, access denied!' });
  };
};