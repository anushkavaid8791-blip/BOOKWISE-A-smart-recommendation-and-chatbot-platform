import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/wishlist', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, wishlist: user?.wishlist || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/wishlist', verifyToken, async (req, res) => {
  try {
    const { bookId, title, author, coverUrl } = req.body;
    if (!title && !bookId) {
      return res.status(400).json({ error: 'Book info required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exists = user.wishlist.some(
      (b) => (bookId && b._id?.toString() === bookId) || (title && b.title === title)
    );

    if (exists) {
      user.wishlist = user.wishlist.filter(
        (b) => !((bookId && b._id?.toString() === bookId) || (title && b.title === title))
      );
      await user.save();
      return res.json({ success: true, message: 'Removed from wishlist', isWishlisted: false, wishlist: user.wishlist });
    } else {
      user.wishlist.push({ title: title || 'Book', author: author || '', addedAt: new Date() });
      await user.save();
      return res.json({ success: true, message: 'Added to wishlist', isWishlisted: true, wishlist: user.wishlist });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/wishlist/:bookId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.wishlist = user.wishlist.filter((item) => item._id?.toString() !== req.params.bookId);
    await user.save();
    res.json({ success: true, message: 'Book removed from wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/streak', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ currentStreak: user?.currentStreak || 0, longestStreak: user?.longestStreak || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/streak/check-in', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.currentStreak = (user.currentStreak || 0) + 1;
    if (user.currentStreak > (user.longestStreak || 0)) {
      user.longestStreak = user.currentStreak;
    }
    await user.save();
    res.json({ success: true, message: 'Check-in successful', streak: user.currentStreak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;