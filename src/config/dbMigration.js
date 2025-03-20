const UserModel = require('../models/UserModel');

// Migration script to add new field to all existing documents in 'users' collection.
const dbMigrationAddField = async () => {
  try {
    const result = await UserModel.find().updateMany({}, { $set: { notifications: [] } });

    console.log('MIGRATION_RESULT: ', result);
  } catch (err) {
    console.error(err);
  };
};

// Migration script to remove specific field from all existing documents in 'users' collection.
const dbMigrationRemoveField = async () => {
  try {
    const result = await UserModel.find().updateMany({}, { $unset: { notifications: [] } });

    console.log('MIGRATION_RESULT: ', result);
  } catch (err) {
    console.error(err);
  };
};

module.exports = {
  dbMigrationAddField,
  dbMigrationRemoveField
};