const NotificationModel = require('../models/NotificationModel');

// Fetch all notifications for a specific user.
const fetchNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    let notifications = await NotificationModel.find({ user: userId })
      .populate('messageId');

    // Remove notifications where messageId was not found.
    notifications = notifications.filter((element) => element.messageId !== null);

    res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// Mark specific notification as read.
const markNotificationAsRead = async (req, res) => {
  try {
    // Notification ID from request params.
    const { notificationId } = req.params;

    await NotificationModel.findByIdAndUpdate(notificationId, { isRead: true });

    res.status(200).json('Notification marked as read.');
  } catch (err) {
    console.error(err);
    res.status(500).json(`Server error: ${err.message}`);
  }
};

// // Create notification for a specific user.
// const createNotification = async (req, res) => {
//   try {
//     // Recipient ID from request params.
//     const { recipientId } = req.params;
//     console.log('RECEPIENT_ID: ', recipientId);

//     // Sender ID from request.
//     const { messageId, senderId, senderName } = req.body;
//     console.log('REQ_BODY: ', req.body);

//     const notification = await NotificationModel.create({
//       user: recipientId,
//       messageId: messageId,
//       content: `New message from ${senderName}`
//     });

//     console.log('NEW_NOTIFICATION: ', notification);

//     res.status(200).json(notification);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json(`Server error: ${err.message}`);
//   }
// };

module.exports = {
  fetchNotifications,
  markNotificationAsRead,
  // createNotification,
};