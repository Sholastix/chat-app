const { Server } = require('socket.io');

const ChatModel = require('../models/ChatModel');
const MessageModel = require('../models/MessageModel');
const NotificationModel = require('../models/NotificationModel');
const UserModel = require('../models/UserModel');

const socket = (server) => {
  try {
    const io = new Server(server, {
      pingTimeout: 30000,
      transports: ['websocket'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Create a variable to check user's online/offline status.
    let usersOnline = [];

    // Create a variable to check in which rooms a user is in.
    let userRooms = [];

    // Add user to 'online users'.
    const addUser = (userId, socketId) => {
      // Check if user already in 'usersOnline' array. If 'YES' - skip it, if 'NO' - add it to array.
      if (!usersOnline.some((element) => element.userId === userId)) {
        usersOnline.push({ userId, socketId });
      }
    };

    // Remove user from 'online users'.
    const removeUser = (socketId) => {
      // Delete from array ID of user which go offline.
      usersOnline = usersOnline.filter((element) => element.socketId !== socketId);
    };

    // User connects to the app.
    io.on('connection', (socket) => {
      let userId = null;
      console.log(`SOCKET_CONNECTED: user with socketId '${socket.id}'.`);

      // Add user to 'online users'.
      socket.on('user_add', async (user) => {
        userId = user._id;

        // Add user to 'users online'.
        addUser(userId, socket.id);

        // Reset 'lastOnline' status for this user to 'null'.
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: userId },
          { $set: { lastOnline: null } },
          { new: true }
        );

        io.emit('last_online_update', {
          userId: updatedUser?._id,
          lastOnline: updatedUser.lastOnline,
        });

        io.emit('connected', `User '${user.username}' with socketId '${socket.id}' connected.`);
        io.emit('users_online', usersOnline);
      });

      // Join chat room.
      // We need this to know if the sender and receiver in the same room. If they are - then no need to add new UI notification of unread message.
      socket.on('room_join', async (room, users, username, userId) => {
        if (room !== null) {
          const socketId = socket.id;

          if (!userRooms.some((element) => element.userId === userId)) {
            userRooms.push({ userId, room, socketId });
          }

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
                isRead: false,
              },
              { $set: { isRead: true } }
            );

            console.log(`Marked ${result.modifiedCount} messages as already read.`);

            // Here we get all updated messages.
            const updatedMessages = await MessageModel.find({
              chat: room,
              sender: notCurrentUser,
              isRead: true,
            });

            updatedMessages.forEach((msg) => {
              const senderSocket = usersOnline.find((user) => user.userId === msg.sender.toString())?.socketId;

              if (senderSocket) {
                io.to(senderSocket).emit('mark_all_messages_as_read', msg);
              }
            });
          } catch (err) {
            console.error(err);
          }
        }
      });

      // Leave chat room.
      // We need this to know if the sender and receiver in the same room. If they are - then no need to add new UI notification of unread message.
      socket.on('room_leave', (room, username, userId) => {
        if (room !== null) {
          userRooms = userRooms.filter((element) => element.room !== room);

          socket.leave(room);
          console.log(`SOCKET_EVENT: ${username} left the room '${room}'.`);
        }
      });

      // Listen for 'typing' event from client.
      socket.on('typing', (room, username) => {
        // Emit 'typing event' to specific room to client.
        socket.to(room).emit('typing', username);
      });

      // Listen for 'message_send' event.
      socket.on('message_send', async (room, data) => {
        // Do this part only in private chat.
        if (!data.chat.isGroupChat) {
          // Determine who exactly is the recipient for our message.
          const recipientId = data.chat.users.find((userId) => userId !== data.sender._id);

          // Check if the recipient is online.
          const isRecipientOnline = usersOnline.some((element) => element.userId === recipientId);

          // Check if the recipient in same chat with sender of this message.
          const isRecepientInSameChat = userRooms.some(
            (element) => element.userId === recipientId && element.room === room
          );

          if (isRecipientOnline && isRecepientInSameChat) {
            // If recipient is online and in the same chat — then message is read immediately.
            await MessageModel.findByIdAndUpdate(data._id, { isRead: true }, { new: true });

            const senderSocket = usersOnline.find((user) => user.userId === data.sender._id)?.socketId;

            if (senderSocket) {
              io.to(senderSocket).emit('mark_one_message_as_read', { messageId: data._id });
            }
          } else {
            // Create new notification if offline or not in chat.
            await NotificationModel.create({
              user: recipientId,
              messageId: data._id,
              content: `New message from ${data.sender.username}`,
            });

            socket.broadcast.emit('notification');
          }
        }

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

        // Here we must populate in classic way without dot notation shortening because Mongoose dot notation for nested 'populate()' doesn't work in this context,
        // when 'lastMessage' property itself is a reference and we need to populate a path within that reference ('lastMessage.sender').
        // This is common Mongoose limitation - Mongoose won't recursively populate unless we explicitly instruct it to using the longer form.
        const updatedChat = await ChatModel.findByIdAndUpdate(data.chat._id, { lastMessage: data._id }, { new: true })
          .populate({
            path: 'lastMessage',
            populate: {
              path: 'sender',
              model: 'User',
              select: '_id avatar username', // here we can select fields we need.
            },
          })
          .populate('users', '_id avatar username');

        io.emit('chat_last_message_update', updatedChat);
      });

      // Listen for 'message edit' event from frontend.
      socket.on('message_edit', async (editedMessage) => {
        try {
          const updatedMessage = await MessageModel.findByIdAndUpdate(
            editedMessage._id,
            { content: editedMessage.content, isEdited: true },
            { new: true }
          ).populate('sender', '_id username avatar');

          // Notify all users in the chat room about the updated message.
          io.to(editedMessage.chatId).emit('message_edited', updatedMessage);
        } catch (err) {
          console.error(err);
        }
      });

      // Listen for 'message delete' event from frontend.
      socket.on('message_delete', async (message) => {
        try {
          const updatedMessage = await MessageModel.findByIdAndUpdate(
            message._id,
            { isDeleted: true },
            { new: true }
          )
            .populate('sender')
            .populate('chat');

          // Notify all users in the chat room about the updated message.
          io.to(message.chat._id).emit('message_deleted', updatedMessage);
        } catch (err) {
          console.error(err);
        }
      });

      // User disconnects from the app.
      socket.on('disconnect', async () => {
        console.log(`SOCKET_DISCONNECTED: user with socketId '${socket.id}'.`);

        userRooms = userRooms.filter((element) => element.socketId !== socket.id);

        // Remove user from 'online users'.
        removeUser(socket.id);

        // Set 'lastOnline' status for this user to datetime when he go offline.
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: userId },
          { $set: { lastOnline: new Date() } },
          { new: true }
        );

        io.emit('last_online_update', {
          userId: updatedUser?._id,
          lastOnline: updatedUser?.lastOnline,
        });

        io.emit('users_online', usersOnline);
      });
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = socket;
