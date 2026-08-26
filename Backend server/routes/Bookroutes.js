import express from 'express';
import { searchBooks, getBookById, getTrendingBooks, rateBook } from '../services/bookService.js';
import { verifyToken, verifyTokenOptional } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10, skip = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    if (q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const books = await searchBooks(q, limit, skip);
    res.json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: 'Invalid limit value' });
    }

    const books = await getTrendingBooks(limit);
    res.json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await getBookById(req.params.id);
    res.json({
      success: true,
      data: book
    });
  } catch (err) {
    res.status(404).json({ 
      success: false,
      error: 'Book not found' 
    });
  }
});

router.post('/:id/rate', verifyToken, async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (rating === undefined || rating === null) {
      return res.status(400).json({ error: 'Rating is required' });
    }

    const ratingNum = parseInt(rating);
    
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const book = await rateBook(req.params.id, ratingNum);
    res.json({
      success: true,
      message: 'Book rated successfully',
      data: book
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;