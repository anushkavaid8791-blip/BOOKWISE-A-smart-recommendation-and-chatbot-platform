import axios from 'axios';
import Book from '../models/Book.js';

const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json';

export const searchBooks = async (query, limit = 10, skip = 0) => {
  try {
    const dbBooks = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ]
    })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

    if (dbBooks.length > 0) return dbBooks;

    const res = await axios.get(OPEN_LIBRARY_API, {
      params: { title: query, limit: 20 }
    });

    if (!res.data.docs || res.data.docs.length === 0) {
      return [];
    }

    const books = res.data.docs.map((doc) => ({
      title: doc.title || 'Unknown Title',
      author: doc.author_name?.[0] || 'Unknown Author',
      isbn: doc.isbn?.[0] || null,
      coverUrl: doc.cover_i 
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      description: doc.first_sentence?.[0] || '',
      publishYear: doc.first_publish_year || null,
      avgRating: 0,
      ratingCount: 0,
      ratings: []
    }));

    await Book.insertMany(books, { ordered: false }).catch(() => {});
    return books.slice(0, parseInt(limit));
  } catch (err) {
    console.error('Search error:', err.message);
    throw new Error('Failed to search books');
  }
};

export const getBookById = async (id) => {
  try {
    const book = await Book.findById(id);
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  } catch (err) {
    throw err;
  }
};

export const getTrendingBooks = async (limit = 10) => {
  try {
    const books = await Book.find()
      .sort({ avgRating: -1, ratingCount: -1 })
      .limit(parseInt(limit));
    return books;
  } catch (err) {
    throw new Error('Failed to fetch trending books');
  }
};

export const rateBook = async (bookId, rating) => {
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    book.ratings.push(rating);
    book.ratingCount = book.ratings.length;
    book.avgRating = (book.ratings.reduce((a, b) => a + b, 0) / book.ratingCount).toFixed(1);

    return await book.save();
  } catch (err) {
    throw err;
  }
};

export const addToWishlist = async (userId, bookId) => {
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  } catch (err) {
    throw err;
  }
};