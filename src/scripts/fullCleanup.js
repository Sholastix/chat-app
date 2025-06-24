const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const mongoose = require('mongoose');

const cleanupOrphanedMessages = require('./cleanupOrphanedMessages');
const cleanupOrphanedNotifications = require('./cleanupOrphanedNotifications');

const fullCleanup = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    console.log('Starting orphaned messages cleanup...');
    await cleanupOrphanedMessages();

    console.log('Starting orphaned notifications cleanup...');
    await cleanupOrphanedNotifications();

    console.log('Full cleanup complete.');
  } catch (err) {
    console.error('Full cleanup error: ', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

fullCleanup();
