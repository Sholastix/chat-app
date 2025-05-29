const UserModel = require('../models/UserModel');

// User auth check.
const auth = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
      .select('-password');

    // // Redundant logic because we added the same check in authMdw.
    // if (!user) {
    //   return res.status(401).json({ message: 'User not found. Possibly deleted.' });
    // }

    res.status(200).json(user);
  } catch (err) {
    console.error('Auth check failed:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  auth,
};
