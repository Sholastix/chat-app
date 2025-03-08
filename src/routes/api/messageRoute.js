const { Router } = require('express');
const router = Router();

// Middleware.
const authMdw = require('../../middleware/authMdw');

// Functions.
const { fetchMessages, sendMessage } = require('../../controllers/messageController');

// @route: GET /api/chat/messages/:chatId
// @desc: Fetch all messages for a specific chat.
// @access: Private.
router.get('/chat/messages/:chatId', authMdw, fetchMessages);

// @route: POST /api/chat/message
// @desc: Send message.
// @access: Private.
router.post('/chat/message', authMdw, sendMessage);

module.exports = router;