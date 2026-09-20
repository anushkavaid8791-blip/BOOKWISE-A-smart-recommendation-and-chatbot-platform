import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth Endpoints
export const authAPI = {
  googleSignIn: async (idToken) => {
    const res = await api.post('/auth/google', { idToken });
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  }
};

// Books Endpoints
export const booksAPI = {
  getTrending: async (limit = 10) => {
    const res = await api.get(`/books/trending?limit=${limit}`);
    return res.data?.data || res.data || [];
  },
  search: async (query, limit = 10) => {
    const res = await api.get(`/books/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return res.data?.data || res.data || [];
  },
  getById: async (id) => {
    const res = await api.get(`/books/${id}`);
    return res.data?.data || res.data;
  },
  rateBook: async (id, rating) => {
    const res = await api.post(`/books/${id}/rate`, { rating });
    return res.data;
  },
  getReadContent: async (title, author = '') => {
    const res = await api.get('/books/read/content', { params: { title, author } });
    return res.data?.data;
  }
};

// Recommendations Endpoints
export const recAPI = {
  byGenre: async (genre) => {
    const res = await api.get(`/recommendations/genre?genre=${encodeURIComponent(genre)}`);
    return res.data?.recommendations || [];
  },
  byMood: async (mood) => {
    const res = await api.get(`/recommendations/mood?mood=${encodeURIComponent(mood)}`);
    return res.data?.recommendations || [];
  },
  byCombo: async (genre, mood) => {
    const res = await api.get(`/recommendations/combo?genre=${encodeURIComponent(genre)}&mood=${encodeURIComponent(mood)}`);
    return res.data?.recommendations || [];
  },
  similar: async (title, author = '') => {
    const res = await api.get(`/recommendations/similar?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`);
    return res.data?.recommendations || [];
  },
  chat: async ({ message, history = [], language = 'auto', bookContext = '' }) => {
    const res = await api.post('/recommendations/chat', { message, history, language, bookContext });
    return {
      reply: res.data?.reply || '',
      books: res.data?.books || []
    };
  }
};

// User & Wishlist Endpoints
export const userAPI = {
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },
  getWishlist: async () => {
    const res = await api.get('/users/wishlist');
    return res.data?.wishlist || [];
  },
  toggleWishlist: async (book) => {
    const res = await api.post('/users/wishlist', {
      bookId: book._id,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl || book.coverImage
    });
    return res.data;
  },
  removeFromWishlist: async (bookId) => {
    const res = await api.delete(`/users/wishlist/${bookId}`);
    return res.data;
  },
  getStreak: async () => {
    const res = await api.get('/users/streak');
    return res.data;
  },
  checkIn: async () => {
    const res = await api.post('/users/streak/check-in');
    return res.data;
  }
};

export default api;
