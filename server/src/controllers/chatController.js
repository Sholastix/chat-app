const ChatModel = require('../models/ChatModel');
const UserModel = require('../models/UserModel');
const MessageModel = require('../models/MessageModel');

// Creating or fetching 1-on-1 chat.
const chat = async (req, res) => {
  try {
    // Current logged in user's ID.
    const userId = req.userId;

    // Our collocutor's ID.
    const collocutorId = req.body.userId;

    if (!collocutorId) {
      console.log('\nERROR: No collocutor\'s ID in request body.');
      return res.status(400).json('\nERROR: No collocutor\'s ID in request body.');
    };

    // Check if 1-on-1 chat with requested users already exists.
    let isChat = await ChatModel.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: collocutorId } } }
      ]
    })
      .populate('users', '-password')
      .populate('lastMessage');

    isChat = await UserModel.populate(isChat, {
      path: 'lastMessage.sender',
      select: 'username email avatar'
    });

    if (isChat.length > 0) {
      // If chat already exists - return it.
      res.json(isChat[0]);
    } else {
      // If chat not exist - create it.
      const newChat = await ChatModel.create({
        chatName: 'sender',
        isGroupChat: false,
        users: [userId, collocutorId]
      });

      // Then populate this created chat with info of it's users (without password).
      const fullChat = await ChatModel.findOne({ _id: newChat._id })
        .populate('users', '-password');

      res.status(201).json(fullChat);
    };
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  };
};

// Get all chats which currently logged in user is a part of.
const fetchChats = async (req, res) => {
  try {
    // Current logged in user's ID.
    const userId = req.userId;

    const chats = await ChatModel.find({
      users: { $elemMatch: { $eq: userId } }
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 }) // Sort from new to old chats.

    const fullChats = await UserModel.populate(chats, {
      path: 'lastMessage.sender',
      select: 'username email avatar'
    });

    res.status(200).json(fullChats);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  };
};

// Create group chat.
const createGroupChat = async (req, res) => {
  try {
    const chatName = req.body.chatName;
    // Current logged in user's ID.
    const userId = req.userId;
    // We get 'users' value from frontend as a string but we need to convert it to object. We can't parse 'undefined' so we must do the additional check.
    let users = req.body.users ? JSON.parse(req.body.users) : req.body.users;

    if (!chatName || !users) {
      console.log('Please fill all the fields.');
      return res.status(400).json({ message: 'Please fill all the fields.' });
    };

    if (users.length < 2) {
      console.log('Group chat requires 2 or more users.');
      return res.status(400).json({ message: 'Group chat requires 2 or more users.' });
    };

    // Also we need to add current logged in user to array.
    users.push(userId);

    // Create group chat.
    const groupChat = await ChatModel.create({
      chatName: chatName,
      groupAdmin: userId,
      isGroupChat: true,
      users: users
    });

    // Populate created group chat wit additional info.
    const fullGroupChat = await ChatModel.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(201).json(fullGroupChat);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  };
};

// // Rename group chat.
// const renameGroupChat = async (req, res) => {
//   try {

//   } catch (err) {
//     console.error(err);
//     res.status(500).json(`Server error: ${err.message}`);
//   };
// };

// // Add someone to group.
// const addToGroup = async (req, res) => {
//   try {

//   } catch (err) {
//     console.error(err);
//     res.status(500).json(`Server error: ${err.message}`);
//   };
// };

// // Remove someone from group or leave the group.
// const removeFromGroup = async (req, res) => {
//   try {

//   } catch (err) {
//     console.error(err);
//     res.status(500).json(`Server error: ${err.message}`);
//   };
// };

module.exports = {
  chat,
  // addToGroup,
  createGroupChat,
  fetchChats,
  // removeFromGroup,
  // renameGroupChat
};