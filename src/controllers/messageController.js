// Models.
const ChatModel = require('../models/ChatModel');
const MessageModel = require('../models/MessageModel');
const UserModel = require('../models/UserModel');

// Functions.
const { truncateWithoutCuttingWord } = require('../helpers/chatLogic');

// Fetch all messages for a specific chat.
const fetchMessages = async (req, res) => {
  try {
    // Chat ID from request params.
    const chatId = req.params.chatId;

    const messages = await MessageModel.find({ chat: chatId })
      .populate('chat')
      .populate('sender', 'username email avatar')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username avatar'
        }
      });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  };
};

// Show preview for hyperlink in message.
const fetchLinkPreview = async (req, res) => {
  const { url } = req.body;

  try {
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=true`);
    const data = await response.json();

    if (!data || data.status !== 'success') {
      console.log('\nERROR: Could not fetch link preview.');
      return res.status(400).json({ error: 'Could not fetch link preview.' });
    };

    const meta = data.data;

    return res.json({
      linkTitle: truncateWithoutCuttingWord(meta.title, 100),
      linkDescription: truncateWithoutCuttingWord(meta.description, 100),
      linkImage: {
        url: meta.image?.url || meta.screenshot?.url
      },
      requestUrl: meta.url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  };
};

// Send message.
const sendMessage = async (req, res) => {
  try {
    // Sender's ID (basically, current logged in user's ID).
    const userId = req.userId;

    // Chat's ID and message's content to send in that chat.
    const { chatId, messageContent, replyTo } = req.body;

    if (!chatId || !messageContent) {
      console.log('\nERROR: Invalid data passed into the request.');
      return res.status(400).json({ error: 'Invalid data passed into the request.' });
    };

    // Create new message.
    const message = await MessageModel.create({
      chat: chatId,
      content: messageContent,
      sender: userId,
      replyTo: replyTo || null
    });

    // // Then populate this created message with selected info of it's sender...
    // let fullMessage = await message.populate('sender', 'username avatar');
    // // ... and full info of it's chat...
    // fullMessage = await message.populate('chat');
    // // ... and selected info about users in this chat.
    // fullMessage = await UserModel.populate(fullMessage, {
    //   path: 'chat.users',
    //   select: 'username email avatar'
    // });

    const fullMessage = await MessageModel.findById(message._id)
      .populate('sender', 'username avatar')
      .populate('chat')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username'
        }
      })
      .populate({
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
    res.status(500).json({ error: 'Server error', message: err.message });
  };
};

// Edit existed message.
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { senderId, content } = req.body;
    const userId = req.userId;

    if (senderId !== userId) {
      console.log('\nERROR: Wrong user, access denied.');
      return;
    };

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { content: content, isEdited: true },
      { new: true }
    )
      .populate('sender')
      .populate('chat');

    res.status(200).json(updatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  };
};

module.exports = {
  editMessage,
  fetchLinkPreview,
  fetchMessages,
  sendMessage
};