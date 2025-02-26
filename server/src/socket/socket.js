const { Server } = require('socket.io');

const socket = (server) => {
  try {
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log(`User with socketId '${socket.id}' connected.`);
    });
  } catch (err) {
    console.error(err);
  };
};

module.exports = socket;
