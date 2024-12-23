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
      default: '../assets/defaultAvatar'
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

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;