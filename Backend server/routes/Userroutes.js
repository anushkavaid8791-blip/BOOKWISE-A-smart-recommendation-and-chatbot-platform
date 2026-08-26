import express from 'express';
import { verifyToken } from '../middleware/Auth.js';

const router = express.Router();

router.get('/profile', verifyToken, (req, res) => {
  res.json({ userId: req.userId });
});

router.get('/wishlist', verifyToken, (req, res) => {
  res.json({ message: 'Wishlist endpoint' });
});

router.post('/wishlist', verifyToken, (req, res) => {
  const { bookId } = req.body;
  if (!bookId) {
    return res.status(400).json({ error: 'Book ID required' });
  }
  res.json({ message: 'Book added to wishlist', bookId });
});

router.delete('/wishlist/:bookId', verifyToken, (req, res) => {
  res.json({ message: 'Book removed from wishlist' });
});

router.get('/streak', verifyToken, (req, res) => {
  res.json({ currentStreak: 0, longestStreak: 0 });
});

router.post('/streak/check-in', verifyToken, (req, res) => {
  res.json({ message: 'Check-in successful', streak: 1 });
});

export default router;