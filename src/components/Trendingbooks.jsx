import React, { useState, useEffect } from 'react';
import { Heart, Star } from './Icons';
import { booksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Trendingbooks.css';

const DEFAULT_TRENDING = [
  {
    _id: 'default-1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    avgRating: 4.8,
    ratingCount: 1420,
    coverUrl: 'https://covers.openlibrary.org/b/id/8432047-L.jpg',
    description: 'Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover, Daisy Buchanan.'
  },
  {
    _id: 'default-2',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    avgRating: 4.9,
    ratingCount: 2310,
    coverUrl: 'https://covers.openlibrary.org/b/id/8314482-L.jpg',
    description: 'A romantic novel of manners following the character development of Elizabeth Bennet, who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial and actual goodness.'
  },
  {
    _id: 'default-3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    avgRating: 4.9,
    ratingCount: 1980,
    coverUrl: 'https://covers.openlibrary.org/b/id/8225261-L.jpg',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, exploring themes of courage, empathy, and racial injustice.'
  }
];

export default function TrendingBooks({ onSelectBook, onReadBook }) {
  const [books, setBooks] = useState(DEFAULT_TRENDING);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toggleWishlist, isBookWishlisted } = useAuth();

  useEffect(() => {
    fetchTrendingBooks();
  }, []);

  const fetchTrendingBooks = async () => {
    try {
      setLoading(true);
      const data = await booksAPI.getTrending(8);
      if (Array.isArray(data) && data.length > 0) {
        setBooks(data);
      }
    } catch (err) {
      console.warn('Could not fetch trending from API, showing curated books:', err.message);
      // Keep DEFAULT_TRENDING without displaying an intrusive error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (books.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % books.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [books.length]);

  if (books.length === 0) return null;

  const currentBook = books[currentIndex] || books[0];
  const isWishlisted = isBookWishlisted(currentBook._id, currentBook.title);

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    await toggleWishlist(currentBook);
  };

  const handleReadClick = () => {
    if (onReadBook) {
      onReadBook(currentBook);
    } else if (onSelectBook) {
      onSelectBook(currentBook);
    }
  };

  return (
    <div className="trending-container">
      <h2 className="trending-title">🔥 Trending Now</h2>

      <div className="trending-content">
        <div className="trending-image-wrapper">
          <img
            src={currentBook.coverUrl || currentBook.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80'}
            alt={currentBook.title}
            className="trending-image"
          />
        </div>

        <div className="trending-info">
          <div className="trending-text">
            <p className="trending-rank">#{currentIndex + 1} Trending</p>
            <h3 className="trending-book-title">{currentBook.title}</h3>
            <p className="trending-author">by {currentBook.author || 'Unknown Author'}</p>

            <div className="trending-rating">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.round(currentBook.avgRating || currentBook.averageRating || 5) ? 'star-filled' : 'star-empty'}
                    fill={i < Math.round(currentBook.avgRating || currentBook.averageRating || 5) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="rating-count">
                ({currentBook.ratingCount || currentBook.ratingsCount || 100}+ reviews)
              </span>
            </div>

            <p className="trending-description">
              {currentBook.description || 'A compelling work of literature that readers across BookWise are actively discovering and sharing.'}
            </p>
          </div>

          <div className="trending-buttons">
            <button className="btn-read-now" onClick={handleReadClick}>
              Explore Book
            </button>
            <button
              className="btn-wishlist"
              onClick={handleWishlistClick}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              style={isWishlisted ? { background: 'rgba(255,255,255,0.4)', color: '#ffd700' } : {}}
            >
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      <div className="trending-dots">
        {books.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`dot ${i === currentIndex ? 'active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}