const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },

    messageId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Message' 
    },

    content: String,

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