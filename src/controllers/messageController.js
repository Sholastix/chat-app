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
          select: 'username avatar',
        },
      });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
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
    }

    const meta = data.data;

    return res.json({
      linkTitle: truncateWithoutCuttingWord(meta.title, 100),
      linkDescription: truncateWithoutCuttingWord(meta.description, 100),
      linkImage: {
        url: meta.image?.url || meta.screenshot?.url,
      },
      requestUrl: meta.url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

const userMessageTimestamps = {};
const MESSAGE_THROTTLE_MS = 1000;

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
    }

    // Throttle сheck (simple in-memory).
    const now = Date.now();
    const lastSent = userMessageTimestamps[userId] || 0;

    if (now - lastSent < MESSAGE_THROTTLE_MS) {
      console.warn('You are sending messages too quickly. Please wait a moment.');
      return res.status(429).json({ error: 'You are sending messages too quickly. Please wait a moment.' });
    }

    // Update last sent time.
    userMessageTimestamps[userId] = now;

    // Create new message.
    const message = await MessageModel.create({
      chat: chatId,
      content: messageContent,
      sender: userId,
      replyTo: replyTo || null,
    });

    // Then populate this created message with...
    const fullMessage = await MessageModel.findById(message._id)
      // ... selected info of it's sender...
      .populate('sender', 'username avatar')
      // ... full info of chat...
      .populate('chat')
      // ... sender's name for 'reply with quote' functionality...
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'username',
        },
      })
      // ... and selected info about users in this chat.
      .populate({
        path: 'chat.users',
        select: 'username email avatar',
      });

    // Update chat (every new message from this user in this chat will be the new value for the 'last message' property and replace previous last message).
    await ChatModel.findByIdAndUpdate(chatId, {
      lastMessage: fullMessage,
    });

    res.status(201).json(fullMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
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
    }

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
  }
};

// Hide existing message in chat for current user.
const hideMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    // Hide the message.
    const hiddenMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { $addToSet: { hiddenBy: userId } },
      {
        new: true,
        timestamps: false, // Prevent updating 'updatedAt' property.
      }
    );

    if (!hiddenMessage) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    res.status(200).json(hiddenMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

// Redisplay a hidden existing message in chat for current user.
const unhideMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    // Unhide the message.
    const unhiddenMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { $pull: { hiddenBy: userId } },
      {
        new: true,
        timestamps: false, // Prevent updating 'updatedAt' property.
      }
    );

    if (!unhiddenMessage) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    res.status(200).json(unhiddenMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { senderId } = req.body;
    const userId = req.userId;

    if (senderId !== userId) {
      console.log('\nERROR: Wrong user, access denied.');
      return res.status(403).json({ error: 'Wrong user, access denied.' });
    }

    // Soft-delete the message.
    await MessageModel.findByIdAndUpdate(messageId, { isDeleted: true });

    // Get deleted message and its chat.
    const deletedMessage = await MessageModel.findById(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    const chatId = deletedMessage.chat;

    // Find latest non-deleted message in that chat.
    const lastVisibleMessage = await MessageModel.findOne({
      chat: chatId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate('sender', '_id username avatar');

    // Update chat's 'lastMessage' property.
    const updatedChat = await ChatModel.findByIdAndUpdate(
      chatId,
      { lastMessage: lastVisibleMessage ? lastVisibleMessage._id : null },
      { new: true }
    )
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: '_id username avatar',
        },
      })
      .populate('users', '_id username avatar');

    res.status(200).json(updatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

module.exports = {
  deleteMessage,
  editMessage,
  fetchLinkPreview,
  fetchMessages,
  hideMessage,
  sendMessage,
  unhideMessage,
};
