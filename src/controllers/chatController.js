// Models.
const ChatModel = require('../models/ChatModel');
const MessageModel = require('../models/MessageModel');
const UserModel = require('../models/UserModel');

// Creating or fetching 1-on-1 chat.
const chat = async (req, res) => {
  try {
    // Current logged in user's ID.
    const userId = req.userId;

    // Our collocutor's ID.
    const collocutorId = req.body.userId;

    if (!collocutorId) {
      console.log("\nERROR: No collocutor's ID in request body.");
      return res.status(400).json("\nERROR: No collocutor's ID in request body.");
    }

    // Check if 1-on-1 private chat with requested users already exists.
    let isChat = await ChatModel.find({
      isGroupChat: false,
      $and: [{ users: { $elemMatch: { $eq: userId } } }, { users: { $elemMatch: { $eq: collocutorId } } }],
    })
      .populate('users', '-password')
      .populate('lastMessage');

    isChat = await UserModel.populate(isChat, {
      path: 'lastMessage.sender',
      select: 'username email avatar',
    });

    if (isChat.length > 0) {
      // Unhide chat for current user if it was previously hidden.
      await ChatModel.findByIdAndUpdate(isChat[0]._id, {
        $pull: { hiddenBy: userId },
      });

      // Reactivate chat for current user if it was previously deleted.
      await ChatModel.findByIdAndUpdate(isChat[0]._id, {
        $pull: { deletedBy: userId },
      });

      // If chat already exists - return it.
      res.json(isChat[0]);
    } else {
      // If chat not exist - create it.
      const newChat = await ChatModel.create({
        chatName: `${Date.now()}`,
        isGroupChat: false,
        users: [userId, collocutorId],
      });

      // Then populate this created chat with info of it's users (without password).
      const fullChat = await ChatModel.findOne({ _id: newChat._id }).populate('users', '-password');

      res.status(201).json(fullChat);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// Get all chats which currently logged in user is a part of.
const fetchChats = async (req, res) => {
  try {
    const userId = req.userId;

    let chats = await ChatModel.find({
      users: { $elemMatch: { $eq: userId } },
      hiddenBy: { $ne: userId },
      deletedBy: { $ne: userId },
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    chats = await UserModel.populate(chats, {
      path: 'lastMessage.sender',
      select: 'username email avatar',
    });

    // Filter out corrupted 1-on-1 chats.
    const validChats = [];

    for (const chat of chats) {
      if (!chat.isGroupChat) {
        // 1-on-1 chat should have exactly 2 users.
        if (!chat.users || chat.users.length !== 2) {
          // Optionally hide it from the current user.
          await ChatModel.findByIdAndUpdate(chat._id, {
            $addToSet: { hiddenBy: userId },
          });

          continue;
        }

        // Check if the other user still exists.
        const otherUser = chat.users.find((u) => u._id.toString() !== userId.toString());
        if (!otherUser) {
          await ChatModel.findByIdAndUpdate(chat._id, {
            $addToSet: { hiddenBy: userId },
          });

          continue;
        }
      }

      validChats.push(chat);
    }

    res.status(200).json(validChats);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// Get one specific chat of the all chats which currently logged in user is a part of.
const fetchChat = async (req, res) => {
  try {
    const chatId = req.params.chatId;

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
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).json(updatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
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
      console.log('\nERROR: Please fill all the fields.');
      return res.status(400).json({ message: 'Please fill all the fields.' });
    }

    if (users.length < 2) {
      console.log('\nERROR: Group chat requires 2 or more users.');
      return res.status(400).json({ message: 'Group chat requires 2 or more users.' });
    }

    // Also we need to add current logged in user to array.
    users.push(userId);

    // Check if group chat with requested chat name already exists.
    const isChatExists = await ChatModel.findOne({ chatName: chatName });

    if (isChatExists) {
      // Then populate existed group chat with additional info (without password).
      const fullExistedChat = await ChatModel.findOne({ _id: isChatExists._id })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

      res.json(fullExistedChat);
    } else {
      // If chat not exist - create it.
      const groupChat = await ChatModel.create({
        chatName: chatName,
        groupAdmin: userId,
        isGroupChat: true,
        users: users,
      });

      // Then populate created group chat with additional info (without password).
      const fullGroupChat = await ChatModel.findOne({ _id: groupChat._id })
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

      res.status(201).json(fullGroupChat);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// Rename group chat.
const renameGroupChat = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const renamedChat = await ChatModel.findByIdAndUpdate(chatId, { chatName: chatName }, { new: true })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!renamedChat) {
      throw new Error('Chat not found.');
    } else {
      res.status(200).json(renamedChat);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// Add someone to group.
const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const updatedChat = await ChatModel.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      throw new Error('Chat not found.');
    } else {
      res.status(200).json(updatedChat);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// Remove someone from group or leave the group.
const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const updatedChat = await ChatModel.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      throw new Error('Chat not found.');
    } else {
      res.status(200).json(updatedChat);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// Hide one specific chat from the current user's chat list.
const hideChatForUser = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await ChatModel.findByIdAndUpdate(chatId, { $addToSet: { hiddenBy: userId } }, { new: true });

    if (!chat) {
      throw new Error('Chat not found.');
    } else {
      res.status(200).json(chat);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// Delete one specific chat from the current user's chat list.
const deleteChatForUser = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    // 1. Mark the chat as deleted for current user.
    const chat = await ChatModel.findByIdAndUpdate(
      chatId,
      { $addToSet: { deletedBy: userId } },
      { new: true }
    );

    if (!chat) {
      throw new Error('Chat not found.');
    }

    // 2. Mark all messages from current user in this chat as deleted (globally, for everyone).
    await MessageModel.updateMany(
      { chat: chatId, sender: userId },
      { isDeleted: true }
    );

    res.status(200).json({ message: 'Chat deleted.', chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
};

module.exports = {
  chat,
  addToGroup,
  createGroupChat,
  deleteChatForUser,
  fetchChat,
  fetchChats,
  hideChatForUser,
  removeFromGroup,
  renameGroupChat,
};
