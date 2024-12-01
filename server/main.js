require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const server = require('node:http').createServer(app);

// Imports.
const dbConnection = require('./src/config/dbConnection');

// Environment variables.
const PORT = process.env.PORT;

// Initialize the middleware.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://127.0.0.1:5173']
}));

// Handle all routes in one file 'index.js' for import convinience.
const routes = require('./src/routes/api/index');

// Set the routes.
app.use('/api/', routes.userRoute);

// Starting the server.
server.listen(PORT, () => {
  console.log(`\nServer running at 'http://localhost:${PORT}'.`);
});

// Database connection.
dbConnection();