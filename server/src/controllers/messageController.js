// Models.
const ChatModel = require('../models/ChatModel');
const MessageModel = require('../models/MessageModel');
const UserModel = require('../models/UserModel');

// Fetch all messages for a specific chat.
const fetchMessages = async (req, res) => {
  try {
    // Chat ID from request params.
    const chatId = req.params.chatId;

    const messages = await MessageModel.find({ chat: chatId })
      .populate('chat')
      .populate('sender', 'username email avatar');

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  };
};

// Send message.
const sendMessage = async (req, res) => {
  try {
    // Sender's ID (basically, current logged in user's ID).
    const userId = req.userId;

    // Chat's ID and message's content to send in that chat.
    const { chatId, messageContent } = req.body;

    if (!chatId || !messageContent) {
      console.log('Invalid data passed into the request.');
      return res.status(400).json('Invalid data passed into the request.');
    };

    // Create new message.
    const message = await MessageModel.create({
      chat: chatId,
      content: messageContent,
      sender: userId
    });

    // Then populate this created message with selected info of it's sender...
    let fullMessage = await message.populate('sender', 'username avatar');
    // ... and full info of it's chat...
    fullMessage = await message.populate('chat');
    // ... and selected info about users in this chat.
    fullMessage = await UserModel.populate(fullMessage, {
      path: 'chat.users',
      select: 'username email avatar'
    });

    // Update chat (every new message from this user in this chat will be the new value for the 'last message' property and replace previous last message).
    await ChatModel.findByIdAndUpdate(chatId, {
      lastMessage: fullMessage
    });

    res.status(201).json(fullMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  };
};

module.exports = {
  fetchMessages,
  sendMessage
};