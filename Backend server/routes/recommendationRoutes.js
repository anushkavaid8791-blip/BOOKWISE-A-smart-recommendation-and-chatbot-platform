// routes/recommendationRoutes.js

import express from 'express';
import * as recService from '../services/recommendationService.js';

const router = express.Router();

// GET /api/recommendations/genre?genre=romance
router.get('/genre', async (req, res) => {
  try {
    const { genre, exclude } = req.query;
    if (!genre) return res.status(400).json({ error: 'genre query param required' });

    const recs = await recService.getGenreRecommendations(genre, exclude);
    const enriched = await recService.enrichWithLocalData(recs);
    res.json({ type: 'genre', genre, recommendations: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recommendations/mood?mood=cozy
router.get('/mood', async (req, res) => {
  try {
    const { mood } = req.query;
    if (!mood) return res.status(400).json({ error: 'mood query param required' });

    const recs = await recService.getMoodRecommendations(mood);
    const enriched = await recService.enrichWithLocalData(recs);
    res.json({ type: 'mood', mood, recommendations: enriched });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/recommendations/combo?genre=romance&mood=relaxed
router.get('/combo', async (req, res) => {
  try {
    const { genre, mood } = req.query;
    if (!genre || !mood)
      return res.status(400).json({ error: 'genre and mood both required' });

    const recs = await recService.getGenreAndMoodRecommendations(genre, mood);
    const enriched = await recService.enrichWithLocalData(recs);
    res.json({ type: 'combo', genre, mood, recommendations: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recommendations/similar?title=Pride and Prejudice&author=Jane Austen
router.get('/similar', async (req, res) => {
  try {
    const { title, author } = req.query;
    if (!title) return res.status(400).json({ error: 'title query param required' });

    const recs = await recService.getSimilarBooks(title, author);
    const enriched = await recService.enrichWithLocalData(recs);
    res.json({ type: 'similar', basedOn: title, recommendations: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recommendations/personalized  (requires auth middleware to attach req.user)
router.get('/personalized', async (req, res) => {
  try {
    const readTitles = req.user?.readBooks || [];
    const recs = await recService.getPersonalizedRecommendations(readTitles);
    const enriched = await recService.enrichWithLocalData(recs);
    res.json({ type: 'personalized', recommendations: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recommendations/chat  (Multilingual literary chat & document Q&A)
router.post('/chat', async (req, res) => {
  try {
    const { message, history, language, bookContext } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message text required' });
    }

    const result = await recService.chatWithBookWise({
      message,
      history,
      language,
      bookContext
    });

    res.json({
      success: true,
      reply: result?.reply || (typeof result === 'string' ? result : ''),
      books: result?.books || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;