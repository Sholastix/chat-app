require('dotenv').config();
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

// Basically here we creating custom authorization middleware.
const authMdw = async (req, res, next) => {
  // Get the token (if it exists) from the header.
  const authHeader = req.header('Authorization');

  // Check token availability.
  if (!authHeader) {
    console.log('\nERROR: Token not provided, authorization denied!');
    return res.status(401).json({ msg: 'Token not provided, authorization denied!' });
  };

  // If we test app with POSTMAN and 'Bearer Token' auth type then POSTMAN adds 'Bearer ' prefix to JWT string which we insert.
  // But if we send token from client then it be just JWT without 'Bearer ' prefix. So we have 2 ways to deal with that:
  // 1. We can add this prefix when we creating JWT in 'signin' and 'signup' functions ( ex.: res.status(200).json({ user, 'Bearer ' + token }); )
  // 2. We can set a simple check for the presence of a prefix 'Bearer ' in the JWT. And in our case we do exactly this.
  authHeader.includes('Bearer') ? token = authHeader.split(' ')[1] : token = authHeader;

  // Verify token.
  try {
    const decoded = jwt.verify(token, jwtSecret);
    
    // With this we can access to our user's ID in all protected routes.
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token, access denied!' });
  };
};

module.exports = authMdw;