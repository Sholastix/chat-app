const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      required: true,
      default: 'https://img.icons8.com/?size=100&id=114064&format=png&color=000000'
    },

    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false }
  },
);

// Here we modifying existed schema (adding 'notifications' document).
userSchema.add({
  notifications: {
    type: Array
  }

  // notifications: [{
  //   notification: {
  //     type: String
  //   }
  // }]
});


// // If we need to remove field from schema we can do it like that:
// userSchema.remove('name_of_the_field');

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;