const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true
    },

    content: {
      type: String,
      required: true
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },

  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: true }
  },
);

const NotificationModel = mongoose.model('Notification', notificationSchema);

module.exports = NotificationModel;