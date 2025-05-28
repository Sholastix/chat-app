const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    chatName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    isGroupChat: {
      type: Boolean,
      default: false,
    },

    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },

    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    hiddenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],

    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
  },

  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const ChatModel = mongoose.model('Chat', chatSchema);

module.exports = ChatModel;
