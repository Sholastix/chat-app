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

    // User connects to the app.
    io.on('connection', (socket) => {
      console.log(`CONNECTED: User with socketId '${socket.id}'.`);

      // User disconnects from the app.
      socket.on('disconnect', () => {
        console.log(`DISCONNECTED: User with socketId '${socket.id}'.`);
      });
    });
  } catch (err) {
    console.error(err);
  };
};

module.exports = socket;
