const { Server } = require('socket.io');

const socket = (server) => {
  try {
    const io = new Server(server, {
      pingTimeout: 30000,
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    // // Create a variable to count the number of active sockets ('Set' constructor contains only unique values so no duplicates alowed).
    // let connectionsCounter = new Set();

    // Create a variable to check user's online/offline status.
    let usersOnline = [];

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
      usersOnline = usersOnline.filter(element => element.socketId !== socketId);
    };

    // User connects to the app.
    io.on('connection', (socket) => {
      console.log(`SOCKET_CONNECTED: user with socketId '${socket.id}'.`);

      // // Add socket to counter.
      // connectionsCounter.add(socket.id);
      // console.log(`Number of active sockets: ${connectionsCounter.size}\n`);

      // Add user to 'online users'.
      socket.on('user_add', (userId) => {
        addUser(userId, socket.id);
        io.emit('users_online', usersOnline);
      });

      // Join chat room.
      socket.on('room_join', (room) => {
        socket.join(room);
        console.log(`SOCKET_EVENT: user joined room '${room}'.`);
      });

      // User disconnects from the app.
      socket.on('disconnect', () => {
        console.log(`SOCKET_DISCONNECTED: user with socketId '${socket.id}'.`);

        // // Remove socket from counter.
        // connectionsCounter.delete(socket.id);
        // console.log(`Number of active sockets: ${connectionsCounter.size}\n`);

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
