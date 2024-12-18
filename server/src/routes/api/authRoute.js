const { Router } = require('express');
const router = Router();

const { auth } = require('../../controllers/authController');

const { authMdw } = require('../../middleware/authMdw');

// @route: GET /api/auth
// @desc: User auth check.
// @access: Private.
router.get('/auth', authMdw, auth);

module.exports = router;