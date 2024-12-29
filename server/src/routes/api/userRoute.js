const { Router } = require('express');
const router = Router();

const { signup, signin } = require('../../controllers/userController');
const { signupSchema, signinSchema } = require('../../validation/userValidation');
const { checkEmail, checkUsername } = require('../../helpers/checkCredentials');

const yupMdw = require('../../middleware/yupMdw');
const { authMdw } = require('../../middleware/authMdw');

const { getUsers } = require('../../controllers/userController');

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
// @desc: Get all users (accordingly to search request) from database.
// @access: Private.
router.get('/users', authMdw, getUsers);

module.exports = router;