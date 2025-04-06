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

    read: { 
      type: Boolean, 
      default: false 
    }
  },

  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false }
  },
);

const NotificationModel = mongoose.model('Notification', notificationSchema);

module.exports = NotificationModel;