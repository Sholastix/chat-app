const ChatModel = require('../models/ChatModel');
const MessageModel = require('../models/MessageModel');

const cleanupOrphanedMessages = async () => {
  const messages = await MessageModel.find({});
  let removedCount = 0;

  for (const message of messages) {
    const exists = await ChatModel.exists({ _id: message.chat });

    if (!exists) {
      await MessageModel.findByIdAndDelete(message._id);
      removedCount++;
    }
  }

  console.log(`Cleanup complete. Removed ${removedCount} orphaned messages.`);
};

module.exports = cleanupOrphanedMessages;
