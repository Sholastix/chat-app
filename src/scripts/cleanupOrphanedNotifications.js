const MessageModel = require('../models/MessageModel');
const NotificationModel = require('../models/NotificationModel');

const cleanupOrphanedNotifications = async () => {
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
};

module.exports = cleanupOrphanedNotifications;
