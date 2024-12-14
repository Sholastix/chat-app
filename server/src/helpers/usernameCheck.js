const UserModel = require('../models/UserModel');

// Check if username is available.
const usernameCheck = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await UserModel.findOne({ username });

    res.json(user);
  } catch (err) {
    console.error(err);
  };
};

module.exports = {
  usernameCheck
};