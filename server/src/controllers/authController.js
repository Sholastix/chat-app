const UserModel = require('../models/UserModel');

// User auth check.
const auth = async (req, res) => {
  try {
    console.log('REQUEST: ', req.userId);

    // Here we get user's ID not from params, but from user's webtoken (which comes from our custom 'authMdw' middleware).
    const user = await UserModel.findById(req.userId)

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  };
};

module.exports = {
  auth
};