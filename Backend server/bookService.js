import axios from "axios";
import Book from "../models/Book.js";

const OPEN_LIBRARY_API = process.env.OPEN_LIBRARY_API || "https://openlibrary.org/api";
const CACHE_EXPIRY_HOURS = parseInt(process.env.CACHE_EXPIRY_HOURS) || 24;

//SEARCH BOOKS 

export const searchBooks = async (query, page = 1) => {
  try {
    if (!query || query.length < 2) {
      throw new Error("Search query must be at least 2 characters");
    }

    console.log(`🔍 Searching for: ${query} (page ${page})`);

    // Step 1: Check MongoDB cache
    const cachedBooks = await Book.find({
      $text: { $search: query },
    })
      .limit(10)
      .lean();

    if (cachedBooks.length > 0) {
      console.log(`✅ Found ${cachedBooks.length} books in cache`);
      return {
        source: "cache",
        books: cachedBooks,
        count: cachedBooks.length,
      };
    }

    // Step 2: Not in cache, call Open Library API
    console.log(`📡 Fetching from Open Library...`);
    
    const response = await axios.get(
      `${OPEN_LIBRARY_API}/search.json`,
      {
        params: {
          title: query,
          limit: 10,
          offset: (page - 1) * 10,
        },
        timeout: 5000, // 5 second timeout
      }
    );

    const apiBooks = response.data.docs || [];
    console.log(`📚 Got ${apiBooks.length} books from API`);

    // Step 3: Transform API data to our format
    const transformedBooks = apiBooks.map((doc) => ({
      title: doc.title || "Unknown Title",
      author: doc.author_name?.[0] || "Unknown Author",
      isbn: doc.isbn?.[0] || null,
      pageCount: doc.number_of_pages_median || 0,
      language: doc.language?.[0] || "en",
      publishYear: doc.first_publish_year || null,
      genre: doc.subject?.slice(0, 5) || [],
      description: doc.subtitle || "",
      averageRating: doc.rating || 0,
      reviewCount: doc.ratings_count || 0,
      source: "openlibrary",
      sourceURL: `https://openlibrary.org${doc.key}`,
      coverImage: doc.cover_id
        ? `https://covers.openlibrary.org/b/id/${doc.cover_id}-M.jpg`
        : null,
    }));

    // Step 4: Save to MongoDB cache (async - don't wait)
    saveToCache(transformedBooks).catch((err) =>
      console.warn("⚠️ Cache save failed:", err.message)
    );

    return {
      source: "api",
      books: transformedBooks,
      count: transformedBooks.length,
    };
  } catch (error) {
    console.error("❌ Search error:", error.message);
    throw new Error(`Book search failed: ${error.message}`);
  }
};

//  GET SINGLE BOOK DETAILS 

export const getBookDetails = async (isbn) => {
  try {
    if (!isbn) {
      throw new Error("ISBN required");
    }

    console.log(`📖 Getting details for ISBN: ${isbn}`);

    // Check cache first
    const cached = await Book.findOne({ isbn }).lean();
    if (cached) {
      console.log(`✅ Book found in cache`);
      return cached;
    }

    // Call Open Library API
    const response = await axios.get(
      `${OPEN_LIBRARY_API}/isbn/${isbn}.json`,
      { timeout: 5000 }
    );

    const book = response.data;

    const bookData = {
      title: book.title,
      author: book.authors?.[0]?.name || "Unknown",
      isbn: isbn,
      description: book.description?.value || book.description || "",
      pageCount: book.number_of_pages || 0,
      publishYear: book.publish_date
        ? new Date(book.publish_date).getFullYear()
        : null,
      language: book.languages?.[0] || "en",
      genre: book.subjects?.slice(0, 5) || [],
      source: "openlibrary",
      sourceURL: `https://openlibrary.org/isbn/${isbn}`,
      coverImage: book.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`
        : null,
    };

    // Save to cache
    await Book.findOneAndUpdate(
      { isbn },
      bookData,
      { upsert: true, new: true }
    ).lean();

    console.log(`✅ Book details cached`);
    return bookData;
  } catch (error) {
    console.error("❌ Get book details error:", error.message);
    throw new Error(`Failed to get book details: ${error.message}`);
  }
};

//  GET BOOKS BY genre
export const getBooksByGenre = async (genre) => {
  try {
    if (!genre) {
      throw new Error("Genre required");
    }

    console.log(`📚 Getting books for genre: ${genre}`);

    // Check cache first
    const cached = await Book.find({
      genre: { $in: [genre.toLowerCase()] },
    })
      .limit(20)
      .lean();

    if (cached.length > 0) {
      console.log(`✅ Found ${cached.length} books in cache`);
      return cached;
    }

    // Call Open Library API (subject endpoint)
    const response = await axios.get(
      `${OPEN_LIBRARY_API}/subjects/${genre.toLowerCase()}.json`,
      {
        params: {
          limit: 20,
        },
        timeout: 5000,
      }
    );

    const books = response.data.works || [];
    console.log(`📚 Got ${books.length} books from API`);

    const transformedBooks = books.map((work) => ({
      title: work.title,
      author: work.authors?.[0]?.name || "Unknown",
      genre: [genre],
      coverImage: work.cover_id
        ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg`
        : null,
      source: "openlibrary",
      sourceURL: `https://openlibrary.org${work.key}`,
      averageRating: work.ratings?.average || 0,
      reviewCount: work.ratings?.count || 0,
    }));

    // Save to cache
    saveToCache(transformedBooks).catch((err) =>
      console.warn("⚠️ Cache save failed:", err.message)
    );

    return transformedBooks;
  } catch (error) {
    console.error("❌ Get by genre error:", error.message);
    throw new Error(`Failed to get books by genre: ${error.message}`);
  }
};


export const getTrendingBooks = async () => {
  try {
    console.log(`🔥 Fetching trending books...`);

    // Check if we have cached trending books
    const cachedTrending = await Book.find({
      averageRating: { $gte: 4.0 },
      reviewCount: { $gte: 100 },
    })
      .sort({ averageRating: -1 })
      .limit(20)
      .lean();

    if (cachedTrending.length >= 10) {
      console.log(`✅ Found ${cachedTrending.length} trending books in cache`);
      return cachedTrending;
    }

    // Call Open Library API for popular books
    const response = await axios.get(
      `${OPEN_LIBRARY_API}/search.json`,
      {
        params: {
          sort: "rating",
          limit: 20,
        },
        timeout: 5000,
      }
    );

    const books = response.data.docs || [];
    console.log(`📚 Got ${books.length} trending books from API`);

    const transformedBooks = books.map((doc) => ({
      title: doc.title,
      author: doc.author_name?.[0] || "Unknown",
      genre: doc.subject?.slice(0, 3) || [],
      averageRating: doc.rating || 0,
      reviewCount: doc.ratings_count || 0,
      coverImage: doc.cover_id
        ? `https://covers.openlibrary.org/b/id/${doc.cover_id}-M.jpg`
        : null,
      source: "openlibrary",
    }));

    return transformedBooks;
  } catch (error) {
    console.error("❌ Get trending error:", error.message);
    throw new Error(`Failed to get trending books: ${error.message}`);
  }
};

export const getAuthorBooks = async (authorName) => {
  try {
    if (!authorName || authorName.length < 2) {
      throw new Error("Author name must be at least 2 characters");
    }

    console.log(`✍️ Getting books by author: ${authorName}`);

    const response = await axios.get(
      `${OPEN_LIBRARY_API}/search.json`,
      {
        params: {
          author: authorName,
          limit: 20,
        },
        timeout: 5000,
      }
    );

    const books = response.data.docs || [];
    console.log(`📚 Found ${books.length} books by ${authorName}`);

    const transformedBooks = books.map((doc) => ({
      title: doc.title,
      author: doc.author_name?.[0] || authorName,
      isbn: doc.isbn?.[0] || null,
      publishYear: doc.first_publish_year,
      genre: doc.subject?.slice(0, 3) || [],
      averageRating: doc.rating || 0,
      coverImage: doc.cover_id
        ? `https://covers.openlibrary.org/b/id/${doc.cover_id}-M.jpg`
        : null,
    }));

    return transformedBooks;
  } catch (error) {
    console.error("❌ Get author books error:", error.message);
    throw new Error(`Failed to get author books: ${error.message}`);
  }
};


const saveToCache = async (books) => {
  try {
    if (!books || books.length === 0) return;

    const cachedBooks = books.map((book) => ({
      ...book,
      addedDate: new Date(),
    }));

    // Use insertMany with ordered: false to skip duplicates
    await Book.insertMany(cachedBooks, { ordered: false });
    console.log(`💾 Cached ${books.length} books`);
  } catch (error) {
    // Ignore duplicate key errors
    if (error.code === 11000) {
      console.log("ℹ️ Some books already cached");
    } else {
      throw error;
    }
  }
};


export const clearOldCache = async () => {
  try {
    const expiryDate = new Date(Date.now() - CACHE_EXPIRY_HOURS * 60 * 60 * 1000);

    const result = await Book.deleteMany({
      addedDate: { $lt: expiryDate },
      source: "openlibrary",
    });

    console.log(`🗑️ Removed ${result.deletedCount} old cached books`);
  } catch (error) {
    console.error("⚠️ Cache cleanup error:", error.message);
  }
};

// ========== GET SIMILAR BOOKS ==========
/**
 * Get books similar to a given book based on genre and rating
 */
export const getSimilarBooks = async (bookTitle) => {
  try {
    console.log(`🔗 Finding similar books to: ${bookTitle}`);

    // Find the original book
    const originalBook = await Book.findOne({
      title: new RegExp(bookTitle, "i"),
    }).lean();

    if (!originalBook) {
      throw new Error("Book not found");
    }

    // Find similar books based on genre
    const similarBooks = await Book.find({
      genre: { $in: originalBook.genre },
      title: { $ne: bookTitle },
      averageRating: { $gte: 3.5 },
    })
      .limit(10)
      .lean();

    return similarBooks;
  } catch (error) {
    console.error("❌ Get similar books error:", error.message);
    throw new Error(`Failed to get similar books: ${error.message}`);
  }
};

export default {
  searchBooks,
  getBookDetails,
  getBooksByGenre,
  getTrendingBooks,
  getAuthorBooks,
  clearOldCache,
  getSimilarBooks,
};