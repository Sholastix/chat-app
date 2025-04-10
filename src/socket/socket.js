const { Server } = require('socket.io');

const NotificationModel = require('../models/NotificationModel');

const socket = (server) => {
  try {
    const io = new Server(server, {
      pingTimeout: 30000,
      transports: ['websocket'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // // Create a variable to count the number of active sockets ('Set' constructor contains only unique values so no duplicates alowed).
    // let connectionsCounter = new Set();

    // Create a variable to check user's online/offline status.
    let usersOnline = [];

    // Create a variable to check in which rooms a user is in.
    let userRooms = [];

    // Add user to 'online users'.
    const addUser = (userId, socketId) => {
      // Check if user already in 'usersOnline' array. If 'YES' - skip it, if 'NO' - add it to array.
      if (!usersOnline.some((element) => element.userId === userId)) {
        usersOnline.push({ userId, socketId });
      };
    };

    // Remove user from 'online users'.
    const removeUser = (socketId) => {
      // Delete from array ID of user which go offline.
      usersOnline = usersOnline.filter((element) => element.socketId !== socketId);
    };

    // User connects to the app.
    io.on('connection', (socket) => {
      console.log(`SOCKET_CONNECTED: user with socketId '${socket.id}'.`);

      // // Add socket to counter.
      // connectionsCounter.add(socket.id);
      // console.log(`\nNumber of active sockets: ${connectionsCounter.size}`);

      // Add user to 'online users'.
      socket.on('user_add', (user) => {
        addUser(user._id, socket.id);
        io.emit('users_online', usersOnline);
        io.emit('connected', `User '${user.username}' with socketId '${socket.id}' connected.`);
      });

      // Join chat room.
      // We need this to know if the sender and receiver in the same room. If they are - then no need to add new UI notification of unread message.
      socket.on('room_join', (room, username, userId) => {
        if (room !== null) {
          console.log('ROOM_JOIN_USER_ID: ', userId);

          // if (!userRooms[userId]) {
          //   userRooms[userId] = [];
          // };

          // userRooms[userId].push(room);

          const socketId = socket.id;

          if (!userRooms.some((element) => element.userId === userId)) {
            userRooms.push({ userId, room, socketId });
          };

          socket.join(room);
          console.log(`SOCKET_EVENT: ${username} joined the room '${room}'.`);
          console.log('ROOM_JOIN: ', userRooms);
        };
      });

      // Leave chat room.
      // We need this to know if the sender and receiver in the same room. If they are - then no need to add new UI notification of unread message.
      socket.on('room_leave', (room, username, userId) => {
        if (room !== null) {
          console.log('ROOM_LEAVE_USER_ID: ', userId);

          // if (userRooms[userId]) {
          //   userRooms[userId] = userRooms[userId].filter((r) => r !== room);
          // };

          userRooms = userRooms.filter((element) => element.room !== room);

          socket.leave(room);
          console.log(`SOCKET_EVENT: ${username} left the room '${room}'.`);
          console.log('ROOM_LEAVE: ', userRooms);
        };
      });

      // Listen for 'typing' event.
      socket.on('typing', (room, username) => {
        // console.log('TYPING_TO_ROOM: ', room);
        // Emit 'typing event' to specific room.
        socket.to(room).emit('typing', username);
      });

      // Listen for 'message_send' event.
      socket.on('message_send', async (room, data) => {
        console.log('MESSAGE_SEND_ROOM: ', room);
        console.log('MESSAGE_SEND_DATA: ', data);

        // Determine who exactly is the recipient for our message.
        const recipientId = data.chat.users.filter((element) => element._id !== data.sender._id)[0]._id;
        console.log('MS_RECIPIENT_ID: ', recipientId);

        // Check if the recipient is online.
        const isRecipientOnline = usersOnline.some((element) => element.userId === recipientId);
        console.log('MS_IS_RECIPIENT_ONLINE: ', isRecipientOnline);

        // Check if the recipient in same chat with sender of this message.
        const isRecepientInSameChat = userRooms.some((element) => element.userId === recipientId && element.room === room);
        console.log('MS_IS_RECEPIENT_IN_SAME_CHAT: ', isRecepientInSameChat);

        // // Check if recipient currently offline or not in chat with sender of this message.
        // if ((!userRooms[recipientId] || !userRooms[recipientId].includes(room))) {
        //   // Create new notification.
        //   const notification = await NotificationModel.create({
        //     user: recipientId,
        //     messageId: data._id,
        //     content: `New message from ${data.sender.username}`
        //   });

        //   console.log('MS_NOTIFICATION: ', notification);
        // };

        // Check if recipient currently offline or not in chat with sender of this message.
        if (!isRecipientOnline || !isRecepientInSameChat) {
          // Create new notification.
          const notification = await NotificationModel.create({
            user: recipientId,
            messageId: data._id,
            content: `New message from ${data.sender.username}`
          });

          console.log('MS_NOTIFICATION: ', notification);
        };

        // Emit 'message_received' event to specific room.
        socket.to(room).emit('message_received', data);
      });

      // User disconnects from the app.
      socket.on('disconnect', () => {
        console.log(`SOCKET_DISCONNECTED: user with socketId '${socket.id}'.`);

        // // Remove socket from counter.
        // connectionsCounter.delete(socket.id);
        // console.log(`\nNumber of active sockets: ${connectionsCounter.size}`);

        userRooms = userRooms.filter((element) => element.socketId !== socket.id);
        console.log('DISCONNECT_ROOMS: ', userRooms);

        // Remove user from 'online users'.
        removeUser(socket.id);
        io.emit('users_online', usersOnline);
      });
    });
  } catch (err) {
    console.error(err);
  };
};

module.exports = socket;
