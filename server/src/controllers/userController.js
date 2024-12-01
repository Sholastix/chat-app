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

module.exports = {
  signup,
};