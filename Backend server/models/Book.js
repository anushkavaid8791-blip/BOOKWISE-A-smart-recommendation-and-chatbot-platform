// models/Book.js
// Book ka data structure — Open Library se fetch karke yahan cache hota h

import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title zaroori h'],
      trim: true
    },
    author: {
      type: String,
      trim: true,
      default: 'Unknown Author'
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true
    },
    coverImage: {
      type: String, // Open Library cover URL
      default: null
    },
    description: {
      type: String,
      default: ''
    },
    genres: [{ type: String }],

    // ===== Rating (users ke reviews se aggregate hoga) =====
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    ratingsCount: {
      type: Number,
      default: 0
    },

    // ===== Source Tracking =====
    openLibraryId: {
      type: String,
      unique: true,
      sparse: true
    },
    publishedYear: Number
  },
  {
    timestamps: true
  }
);

// Title + Author pe search fast karne ke liye index
bookSchema.index({ title: 'text', author: 'text' });

const Book = mongoose.model('Book', bookSchema);

export default Book;