// Set our environment variables in '.env.local' instead of '.env'.
require('dotenv').config({ path: '.env.local' });
const cors = require('cors');
const express = require('express');
const { createServer } = require('node:http');
const path = require('node:path');

const app = express();
const server = createServer(app);

// Imports.
const dbConnection = require('./config/dbConnection');
const socket = require('./socket/socket');

// Environment variables.
const PORT = process.env.PORT;

// Initialize the middleware.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Сross-origin resource sharing permission.
app.use(cors({
  origin: ['http://localhost:5173']
}));

// Handle all routes in one file 'index.js' for import convinience.
const routes = require('./routes/api/index');

// Set the routes.
app.use('/api/', routes.authRoute);
app.use('/api/', routes.chatRoute);
app.use('/api/', routes.messageRoute);
app.use('/api/', routes.userRoute);

// -----------------   DEPLOYMENT - START   -----------------

if (process.env.NODE_ENV === 'production') {
  app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client', 'dist', 'index.html'));
    // res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
};

// -----------------   DEPLOYMENT - END   -----------------

// Starting the server.
server.listen(PORT, () => {
  console.log(`\nServer running at 'http://localhost:${PORT}'.`);
});

// Database connection.
dbConnection();

// Socket.IO
socket(server);