const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const dbConnection = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('\nDatabase connected.');
  } catch (err) {
    console.error(`\nConnection failed: ${MONGODB_URI}`, err.message);
    process.exit(1);
  }
};

module.exports = dbConnection;
