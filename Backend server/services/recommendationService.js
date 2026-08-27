// services/recommendationService.js
// Groq AI se book recommendations generate karta h — genre + mood dono support karta h


import axios from 'axios';
import Book from '../models/Book.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'openai/gpt-oss-20b';

const SUPPORTED_MOODS = [
  'happy', 'sad', 'relaxed', 'adventurous', 'romantic',
  'thoughtful', 'motivated', 'nostalgic', 'curious', 'cozy'
];

async function callGroq(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY .env mein set nahi h');
  }

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a book recommendation engine. Always respond with ONLY valid JSON, no preamble, no markdown fences. Format: {"recommendations": [{"title": "", "author": "", "reason": ""}]}'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    }
  );

  let raw = response.data.choices[0].message.content.trim();
  raw = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
}

async function getGenreRecommendations(genre, excludeTitle = null) {
  const prompt = `Suggest 6 popular books in the "${genre}" genre.${
    excludeTitle ? ` Do not include "${excludeTitle}".` : ''
  } For each, give title, author, and a one-line reason it fits the genre.`;
  const data = await callGroq(prompt);
  return data.recommendations || [];
}

async function getMoodRecommendations(mood) {
  if (!SUPPORTED_MOODS.includes(mood.toLowerCase())) {
    throw new Error(`Unsupported mood. Supported: ${SUPPORTED_MOODS.join(', ')}`);
  }
  const prompt = `Suggest 6 books perfect for someone feeling "${mood}" right now. Consider pacing, tone, and emotional weight — match the mood, not just the genre. For each, give title, author, and a one-line reason it fits this mood.`;
  const data = await callGroq(prompt);
  return data.recommendations || [];
}

async function getGenreAndMoodRecommendations(genre, mood) {
  const prompt = `Suggest 6 books that are BOTH in the "${genre}" genre AND fit someone feeling "${mood}". For each, give title, author, and a one-line reason it fits both.`;
  const data = await callGroq(prompt);
  return data.recommendations || [];
}

async function getSimilarBooks(bookTitle, author = '') {
  const prompt = `Suggest 6 books similar to "${bookTitle}"${
    author ? ` by ${author}` : ''
  } in theme, tone, or style. For each, give title, author, and a one-line reason it's similar.`;
  const data = await callGroq(prompt);
  return data.recommendations || [];
}

async function getPersonalizedRecommendations(userReadTitles = []) {
  if (userReadTitles.length === 0) {
    return getGenreRecommendations('bestseller fiction');
  }
  const prompt = `A reader has enjoyed these books: ${userReadTitles.join(
    ', '
  )}. Suggest 6 new books they would likely enjoy next, based on patterns in their taste. For each, give title, author, and a one-line reason.`;
  const data = await callGroq(prompt);
  return data.recommendations || [];
}

async function enrichWithLocalData(recommendations) {
  const enriched = await Promise.all(
    recommendations.map(async (rec) => {
      const existing = await Book.findOne({
        title: new RegExp(`^${rec.title}$`, 'i')
      });
      return {
        ...rec,
        coverImage: existing?.coverImage || null,
        averageRating: existing?.averageRating || null,
        inDatabase: !!existing
      };
    })
  );
  return enriched;
}

export {
  SUPPORTED_MOODS,
  getGenreRecommendations,
  getMoodRecommendations,
  getGenreAndMoodRecommendations,
  getSimilarBooks,
  getPersonalizedRecommendations,
  enrichWithLocalData
};