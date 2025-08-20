const { Router } = require('express');
const router = Router();

// Middleware.
const authMdw = require('../../middleware/authMdw');
const yupMdw = require('../../middleware/yupMdw');

// Functions.
const { getUser, searchUsers, signin, signup, updateUser } = require('../../controllers/userController');
const { signinSchema, signupSchema } = require('../../validation/userValidation');
const { checkEmail, checkUsername } = require('../../helpers/checkCredentials');

// -------   PUBLIC   -------

// @route: POST /api/signup
// @desc: Register new user.
// @access: Public.
router.post('/signup', yupMdw(signupSchema), signup);

// @route: POST /api/signin
// @desc: User login.
// @access: Public.
router.post('/signin', yupMdw(signinSchema), signin);

// @route: GET /api/user/username/:username
// @desc: Check if username is available.
// @access: Public.
router.get('/user/username/:username', checkUsername);

// @route: GET /api/user/email/:email
// @desc: Check if email is available.
// @access: Public.
router.get('/user/email/:email', checkEmail);

// -------   PRIVATE   -------

// @route: GET /api/users
// @desc: Get all users (except current user) from DB accordingly to search parameters.
// @access: Private.
router.get('/users/search', authMdw, searchUsers);

// @route: GET /api/user/:id
// @desc: Get specific user from database.
// @access: Private.
router.get('/user/:id', authMdw, getUser);

// @route: PUT /api/user/:id
// @desc: Update user's profile.
// @access: Private.
router.put('/user/:id', authMdw, updateUser);

module.exports = router;
