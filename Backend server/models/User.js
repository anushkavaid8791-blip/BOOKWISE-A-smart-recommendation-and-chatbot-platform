// models/User.js
// User ka data structure — MongoDB mein isi shape mein save hoga

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // ===== Basic Info =====
    name: {
      type: String,
      required: [true, 'Name zaroori h'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email zaroori h'],
      unique: true,
      lowercase: true,
      trim: true
    },

    // ===== Google Sign-in =====
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    profilePicture: {
      type: String,
      default: null
    },

    // ===== Reading Data (Recommendations ke liye) =====
    readBooks: [
      {
        title: { type: String, required: true },
        author: String,
        rating: { type: Number, min: 1, max: 5 },
        readAt: { type: Date, default: Date.now }
      }
    ],
    favoriteGenres: [{ type: String }],

    // ===== Wishlist / To-read =====
    wishlist: [
      {
        title: String,
        author: String,
        addedAt: { type: Date, default: Date.now }
      }
    ],

    // ===== Reading Streak =====
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: null
    },

    // ===== Account Meta =====
    isVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;