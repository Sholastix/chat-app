const UserModel = require('../models/UserModel');

// Check if email is available.
const emailCheck = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await UserModel.findOne({ email });

    res.json(user);
  } catch (err) {
    console.error(err);
  };
};

module.exports = {
  emailCheck
};