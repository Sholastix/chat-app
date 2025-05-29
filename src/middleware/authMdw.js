require('dotenv').config();
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const jwtSecret = process.env.JWT_SECRET;

// Basically here we creating custom authorization middleware.
const authMdw = async (req, res, next) => {
  // Get the token (if it exists) from the header.
  const authHeader = req.header('Authorization');

  // Check token availability.
  if (!authHeader) {
    console.log('\nERROR: Token not provided, authorization denied!');
    return res.status(401).json({ msg: 'Token not provided, authorization denied!' });
  }

  // Check token format.
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Invalid token format, authorization denied!' });
  }

  // Get the raw token without 'Bearer ' prefix.
  const token = authHeader.split(' ')[1];

  // Verify token.
  try {
    const decoded = jwt.verify(token, jwtSecret);

    // Double check if the user still exists in database.
    const user = await UserModel.findById(decoded.id);

    // If user don't exist then auth process stopped right here.
    if (!user) {
      return res.status(401).json({ msg: 'User no longer exists, access denied!' });
    }

    // With this we can access to our user's ID in all protected routes.
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token, access denied!' });
  }
};

module.exports = authMdw;
