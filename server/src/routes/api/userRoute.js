// const router = require('express').Router();
const { Router } = require('express');
const router = Router();

const { signup } = require('../../controllers/userController');

// @route: POST /api/signup
// @desc: Register new user.
// @access: Public.
router.post('/signup', signup);

module.exports = router;