const UserModel = require('../models/UserModel');

// Check if password meets the requirements.
// REQUIREMENTS: password must contain minimum five characters. At least one of them must be letter and another one - number.
const checkPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;

// Check if email is already in use.
const checkEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await UserModel.findOne({ email });

    res.json(user);
  } catch (err) {
    console.error(err);
  }
};

// Check if username is already in use.
const checkUsername = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await UserModel.findOne({ username });

    res.json(user);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  checkEmail,
  checkPassword,
  checkUsername,
};
