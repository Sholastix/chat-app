const { Router } = require('express');
const router = Router();

// Middleware.
const authMdw = require('../../middleware/authMdw');

// Functions.
const {
  chat,
  // addToGroup,
  createGroupChat,
  fetchChats,
  // removeFromGroup,
  // renameGroupChat
} = require('../../controllers/chatController');

// @route: POST /api/chat
// @desc: Creating or fetching 1-on-1 chat.
// @access: Private.
router.post('/chat', authMdw, chat);

// @route: GET /api/chat
// @desc: Get all chats which currently logged in user is a part of.
// @access: Private.
router.get('/chat', authMdw, fetchChats);

// @route: POST /api/chat/group
// @desc: Create group chat.
// @access: Private.
router.post('/chat/group', authMdw, createGroupChat);

// // @route: PUT /api/chat/group/rename
// // @desc: Rename existed group chat.
// // @access: Private.
// router.put('/chat/group/rename', authMdw, renameGroupChat);

// // @route: PUT /api/chat/group/addtogroup
// // @desc: Add someone to group.
// // @access: Private.
// router.put('/chat/group/add', authMdw, addToGroup);

// // @route: PUT /api/chat/group/removefromgroup
// // @desc: Remove someone from group or leave the group.
// // @access: Private.
// router.put('/chat/group/remove', authMdw, removeFromGroup);

module.exports = router;