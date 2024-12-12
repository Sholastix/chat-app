const { Router } = require('express');
const router = Router();

const { signup, signin, usernameCheck, emailCheck } = require('../../controllers/userController');
const { signupSchema, signinSchema } = require('../../validation/userValidation');
const authMdw = require('../../middleware/authMdw');
const yupMdw = require('../../middleware/yupMdw');

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
router.get('/user/username/:username', usernameCheck);

// @route: GET /api/user/email/:email
// @desc: Check if email is available.
// @access: Public.
router.get('/user/email/:email', emailCheck);

module.exports = router;