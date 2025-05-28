const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models.
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
    }

    // Check if user with this email already exists.
    user = await UserModel.findOne({ email });

    if (user) {
      console.error(`\nERROR: User with email '${email}' already exists.`);
      return res.status(409).json({ errors: [{ message: `User with email '${email}' already exists.` }] });
    }

    // Encrypt user's password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user's profile in database.
    user = await UserModel.create({
      username: username,
      email: email,
      password: hashedPassword,
    });

    // Create jsonwebtoken for user.
    const jwtPayload = { id: user._id };
    const jwtSecret = process.env.JWT_SECRET;
    const jwtLifespan = '10h';

    jwt.sign(jwtPayload, jwtSecret, { expiresIn: jwtLifespan, algorithm: 'HS256' }, (err, token) => {
      if (err) {
        throw err;
      } else {
        console.log('\nRegistration completed successfully: ', { user, token });
        res.status(201).json({ user, token });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
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
    }

    // Compare input password and password from database.
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords doesn't match then show error message.
    if (!isMatch) {
      console.error('\nERROR: Incorrect password.');
      return res.status(401).json({ errors: [{ message: 'Incorrect password.' }] });
    }

    // Create jsonwebtoken for user.
    const jwtPayload = { id: user._id };
    const jwtSecret = process.env.JWT_SECRET;
    const jwtLifespan = '10h';

    jwt.sign(jwtPayload, jwtSecret, { expiresIn: jwtLifespan, algorithm: 'HS256' }, (err, token) => {
      if (err) {
        throw err;
      } else {
        console.log('\nUser logged in successfully: ', { user, token });
        res.status(200).json({ user, token });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// Get all users (except currently logged in user) from database accordingly to search parameters.
const getUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: 'i' } },
            // { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    // Find all users except currently logged in user.
    const users = await UserModel.find(keyword).find({ _id: { $ne: req.userId } });

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// Get specific user's profile.
const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// Update user's profile.
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { picture, username } = req.body;

    // Updating picture and name from 'user profile' form.
    if (picture && username) {
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        {
          avatar: picture,
          username: username,
        },
        { new: true }
      );

      res.status(200).json(updatedUser);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

module.exports = {
  getUser,
  getUsers,
  signin,
  signup,
  updateUser,
};
