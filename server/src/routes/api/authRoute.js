const { Router } = require('express');
const router = Router();

// Middleware.
const authMdw = require('../../middleware/authMdw');

// Functions.
const { auth } = require('../../controllers/authController');

// @route: GET /api/auth
// @desc: User auth check.
// @access: Private.
router.get('/auth', authMdw, auth);

module.exports = router;