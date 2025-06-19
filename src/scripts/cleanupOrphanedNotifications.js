const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const mongoose = require('mongoose');

// Models.
const MessageModel = require('../models/MessageModel');
const NotificationModel = require('../models/NotificationModel');

const cleanupOrphanedNotifications = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    await mongoose.connect(MONGODB_URI);

    const notifications = await NotificationModel.find({});
    let removedCount = 0;

    for (const notification of notifications) {
      const exists = await MessageModel.exists({ _id: notification.messageId });

      if (!exists) {
        await NotificationModel.findByIdAndDelete(notification._id);
        removedCount++;
      }
    }

    console.log(`Cleanup complete. Removed ${removedCount} orphaned notifications.`);
    mongoose.disconnect();
  } catch (err) {
    console.error('Cleanup error:', err);
    mongoose.disconnect();
  }
};

cleanupOrphanedNotifications();
