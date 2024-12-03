// const router = require('express').Router();
const { Router } = require('express');
const router = Router();

const { signup, usernameCheck, emailCheck } = require('../../controllers/userController');
const { signupSchema } = require('../../validation/userValidation');
const yupMdw = require('../../middleware/yupMdw');

// @route: POST /api/signup
// @desc: Register new user.
// @access: Public.
router.post('/signup', yupMdw(signupSchema), signup);

// @route: GET /api/user/username/:username
// @desc: Check if username is available.
// @access: Public.
router.get('/user/username/:username', usernameCheck);

// @route: GET /api/user/email/:email
// @desc: Check if email is available.
// @access: Public.
router.get('/user/email/:email', emailCheck);

module.exports = router;