const bcrypt = require('bcryptjs');

const UserModel = require('../models/UserModel');

// Register new user.
const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user with this username already exists.
    let user = await UserModel.findOne({ username });

    if (user) {
      console.error(`\nERROR: User with username '${username}' already exists.`);
      return res.status(409).json({ errors: [{ message: `User with username '${username}' already exists.` }] });
    };

    // Check if user with this email already exists.
    user = await UserModel.findOne({ email });

    if (user) {
      console.error(`\nERROR: User with email '${email}' already exists.`);
      return res.status(409).json({ errors: [{ message: `User with email '${email}' already exists.` }] });
    };

    // Encrypt user's password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user's profile in database.
    user = await UserModel.create({
      username: username,
      email: email,
      password: hashedPassword,
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  };
};

// User login.
const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user with this email exists in database.
    const user = await UserModel.findOne({ email });

    // If user not found then show error message.
    if (!user) {
      console.error(`\nERROR: User with email '${email}' not found.`);
      return res.status(400).json({ errors: [{ message: `User with email '${email}' not found.` }] });
    };

    // Compare input password and password from database.
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords doesn't match then show error message.
    if (!isMatch) {
      console.error('\nERROR: Passwords does not match.');
      return res.status(401).json({ errors: [{ message: 'Passwords does not match.' }] });
    };

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  };
};

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
  emailCheck,
  signin,
  signup,
  usernameCheck
};