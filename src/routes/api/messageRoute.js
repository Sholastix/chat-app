const { Router } = require('express');
const router = Router();

// Middleware.
const authMdw = require('../../middleware/authMdw');

// Functions.
const {
  editMessage,
  fetchLinkPreview,
  fetchMessages,
  sendMessage
} = require('../../controllers/messageController');

// @route: GET /api/chat/messages/:chatId
// @desc: Fetch all messages for a specific chat.
// @access: Private.
router.get('/chat/messages/:chatId', authMdw, fetchMessages);

// @route: POST /api/chat/message
// @desc: Send message.
// @access: Private.
router.post('/chat/message', authMdw, sendMessage);

// @route: POST /api/chat/message/hyperlinkPreview
// @desc: Show preview for hyperlink in message.
// @access: Private.
router.post('/chat/message/linkPreview', authMdw, fetchLinkPreview);

// @route: PUT /api/chat/message/:messageId
// @desc: Edit existed message.
// @access: Private.
router.put('/chat/message/:messageId', authMdw, editMessage);

module.exports = router;
