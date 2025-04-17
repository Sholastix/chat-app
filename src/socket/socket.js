const { Server } = require('socket.io');

const MessageModel = require('../models/MessageModel');
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
      socket.on('room_join', async (room, users, username, userId) => {
        if (room !== null) {
          const socketId = socket.id;
          
          if (!userRooms.some((element) => element.userId === userId)) {
            userRooms.push({ userId, room, socketId });
          };
          
          socket.join(room);
          console.log(`SOCKET_EVENT: ${username} joined the room '${room}'.`);

          // This will be sender of specific message. (Maybe later we will just add field 'receiver' in 'MessageModel' instead of this twisted logic).
          const notCurrentUser = users.filter((element) => element._id !== userId)[0]._id;

          // Marks all unread messages as read when the recipient of this messages enters a chat with this messages.
          try {
            const result = await MessageModel.updateMany(
              {
                chat: room,
                sender: notCurrentUser,
                isRead: false
              },
              { $set: { isRead: true } }
            );

            console.log(`Marked ${result.modifiedCount} messages as already read.`);
          } catch (err) {
            console.error(err);
          };
        };
      });

      // Leave chat room.
      // We need this to know if the sender and receiver in the same room. If they are - then no need to add new UI notification of unread message.
      socket.on('room_leave', (room, username, userId) => {
        if (room !== null) {
          userRooms = userRooms.filter((element) => element.room !== room);

          socket.leave(room);
          console.log(`SOCKET_EVENT: ${username} left the room '${room}'.`);
        };
      });

      // Listen for 'typing' event.
      socket.on('typing', (room, username) => {
        // Emit 'typing event' to specific room.
        socket.to(room).emit('typing', username);
      });

      // Listen for 'message_send' event.
      socket.on('message_send', async (room, data) => {
        // Do this part only in private chat.
        if (!data.chat.isGroupChat) {
          // Determine who exactly is the recipient for our message.
          const recipientId = data.chat.users.filter((element) => element._id !== data.sender._id)[0]._id;

          // Check if the recipient is online.
          const isRecipientOnline = usersOnline.some((element) => element.userId === recipientId);

          // Check if the recipient in same chat with sender of this message.
          const isRecepientInSameChat = userRooms.some((element) => element.userId === recipientId && element.room === room);

          // Check if recipient currently offline or not in chat with sender of this message.
          if (!isRecipientOnline || !isRecepientInSameChat) {
            // Create new notification.
            await NotificationModel.create({
              user: recipientId,
              messageId: data._id,
              content: `New message from ${data.sender.username}`
            });

            // Emit event to client when notification is created.
            socket.broadcast.emit('notification');
          };
        };

        // // Template for group chat (maybe later we add it to app).
        // if (data.chat.isGroupChat) {
        //   // Determine who exactly is the recipient for our message.
        //   const recipientId = !data.chat.isGroupChat
        //     ? data.chat.users.filter((element) => element._id !== authState.user._id)[0]._id
        //     : data.chat.users.filter((element) => element._id !== authState.user._id);
        //   console.log('MS_RECIPIENT_ID: ', recipientId);

        //   // Check if the recipient is online.
        //   const isRecipientOnline = !data.chat.isGroupChat
        //     ? chatState.usersOnline.some((element) => element.userId === recipientId)
        //     : chatState.usersOnline.map((element) => element.userId === recipientId)
        //   console.log('MS_IS_RECIPIENT_ONLINE: ', isRecipientOnline);
        // };

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
