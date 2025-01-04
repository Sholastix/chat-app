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

// // Get all messages from database for particular user. 
// const fetchChats = async (req, res) => {
//   try {

//   } catch (err) {
//     console.error(err);
//     res.status(500).json(`Server error: ${err.message}`);
//   };
// };

// // Create group chat.
// const createGroupChat = async (req, res) => {
//   try {

//   } catch (err) {
//     console.error(err);
//     res.status(500).json(`Server error: ${err.message}`);
//   };
// };

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
  // createGroupChat,
  // fetchChats,
  // removeFromGroup,
  // renameGroupChat
};