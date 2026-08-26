import React, { useState, useEffect } from 'react';
import { Heart, Star } from 'lucide-react';
import axios from 'axios';

export default function TrendingBooks() {
  const [books, setBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendingBooks();
    const interval = setInterval(fetchTrendingBooks, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrendingBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/books/trending?limit=10');
      setBooks(res.data);
      setCurrentIndex(0);
    } catch (err) {
      setError('Failed to load trending books');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (books.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % books.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [books.length]);

  if (loading && books.length === 0) return <div className="text-center py-10">Loading trending books...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (books.length === 0) return null;

  const currentBook = books[currentIndex];

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-white mb-8">
      <h2 className="text-3xl font-bold mb-6">🔥 Trending Now</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <img 
            src={currentBook.coverUrl || 'https://via.placeholder.com/300x400'} 
            alt={currentBook.title}
            className="rounded-lg shadow-lg max-h-96 mx-auto"
          />
        </div>

        <div className="flex flex-col justify-between h-96">
          <div>
            <p className="text-sm text-gray-200 mb-2">#{currentIndex + 1} Trending</p>
            <h3 className="text-2xl font-bold mb-2">{currentBook.title}</h3>
            <p className="text-gray-200 mb-4">{currentBook.author}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    className={i < Math.round(currentBook.avgRating || 0) ? 'fill-yellow-300 text-yellow-300' : 'text-gray-400'}
                  />
                ))}
              </div>
              <span className="text-sm">({currentBook.ratingCount || 0} reviews)</span>
            </div>

            <p className="text-sm text-gray-200 line-clamp-3">{currentBook.description || 'No description available'}</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button className="flex-1 bg-white text-purple-600 font-semibold py-2 rounded-lg hover:bg-gray-100">
              Read Now
            </button>
            <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {books.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}