// const router = require('express').Router();
const { Router } = require('express');
const router = Router();

const { signup } = require('../../controllers/userController');
const { signupSchema } = require('../../validation/userValidation');
const yupMdw = require('../../middleware/yupMdw');

// @route: POST /api/signup
// @desc: Register new user.
// @access: Public.
router.post('/signup', yupMdw(signupSchema), signup);

module.exports = router;