const { Router } = require('express');
const router = Router();

// Middleware.
const authMdw = require('../../middleware/authMdw');

// Functions.
const { 
    createNotification, 
    fetchNotifications, 
    markNotificationAsRead 
} = require('../../controllers/notificationController');

// @route: GET /api/chat/notifications/:userId
// @desc: Fetch all notifications for a specific user.
// @access: Private.
router.get('/chat/notifications/:userId', authMdw, fetchNotifications);

// @route: POST /api/chat/notifications/:recipientId/create
// @desc: Create notification.
// @access: Private.
router.post('/chat/notifications/:recipientId/create', authMdw, createNotification);

// @route: PUT /api/chat/notifications/:notificationId/read
// @desc: Mark notification as read.
// @access: Private.
router.put('/chat/notifications/:notificationId/read', authMdw, markNotificationAsRead);

module.exports = router;