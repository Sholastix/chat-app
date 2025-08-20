const { Router } = require('express');
const router = Router();

// Middleware.
const authMdw = require('../../middleware/authMdw');

// Functions.
const {
  chat,
  addToGroup,
  deleteChatForUser,
  fetchChat,
  fetchChats,
  groupChat,
  hideChatForUser,
  removeFromGroup,
  renameGroupChat,
  searchGroupChats,
} = require('../../controllers/chatController');

// @route: POST /api/chat
// @desc: Create or fetch 1-on-1 chat.
// @access: Private.
router.post('/chat', authMdw, chat);

// @route: GET /api/chat
// @desc: Get all chats which currently logged in user is a part of.
// @access: Private.
router.get('/chat', authMdw, fetchChats);

// @route: GET /api/chat
// @desc: Get one specific chat of the all chats which currently logged in user is a part of.
// @access: Private.
router.get('/chat/:chatId', authMdw, fetchChat);

// @route: POST /api/chat/group
// @desc: Create or fetch group chat.
// @access: Private.
router.post('/chat/group', authMdw, groupChat);

// @route: PUT /api/chat/group/rename
// @desc: Rename existed group chat.
// @access: Private.
router.put('/chat/group/rename', authMdw, renameGroupChat);

// @route: PUT /api/chat/group/add
// @desc: Add someone to group.
// @access: Private.
router.put('/chat/group/add', authMdw, addToGroup);

// @route: PUT /api/chat/group/remove
// @desc: Remove someone from group or leave the group.
// @access: Private.
router.put('/chat/group/remove', authMdw, removeFromGroup);

// @route: GET /api/chat/group/search
// @desc: Get all group chats from DB accordingly to search parameters.
// @access: Private.
router.get('/chat/group/search', authMdw, searchGroupChats);

// @route: PUT /api/chat/hide
// @desc: Hide chat in chat list.
// @access: Private.
router.put('/chat/hide', authMdw, hideChatForUser);

// @route: PUT /api/chat/delete
// @desc: Delete chat from chat list.
// @access: Private.
router.put('/chat/delete', authMdw, deleteChatForUser);

module.exports = router;
