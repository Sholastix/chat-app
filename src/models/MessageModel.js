const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat'
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    content: {
      type: String,
      trim: true
    },

    isRead: {
      type: Boolean,
      default: false
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    }
  },

  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: true }
  },
);

const MessageModel = mongoose.model('Message', messageSchema);

module.exports = MessageModel;