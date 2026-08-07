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
      sparse: true // sparse: allows multiple docs with null googleId (agar email/password wale bhi ho)
    },
    profilePicture: {
      type: String, // Google se aayi photo URL
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
    timestamps: true // createdAt, updatedAt auto add ho jayenge
  }
);

// Password kabhi bhi response mein na jaye (agar future mein email/password auth bhi add karein)
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;