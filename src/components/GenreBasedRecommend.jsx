import React, { useState, useEffect } from 'react';
import BookCard from './BookCard';
import { recAPI } from '../services/api';
import './GenreBasedRecommend.css';

export default function GenreBasedRecommend({ genre, onSelectBook }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!genre) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    recAPI.byGenre(genre)
      .then((data) => {
        if (isMounted) {
          // Normalize recommendations to match BookCard props
          const formatted = data.map((b, idx) => ({
            _id: b._id || `genre-${genre}-${idx}`,
            title: b.title,
            author: b.author,
            coverUrl: b.coverImage || b.coverUrl,
            avgRating: b.averageRating || 4.7,
            reason: b.reason,
            description: b.reason || `A standout work in ${genre}.`
          }));
          setBooks(formatted);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Genre recommendation error:', err);
          setError('Could not load books for this genre.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [genre]);

  if (!genre) return null;

  return (
    <div className="genre-recommend">
      <div className="genre-rec-header">
        <h3>Featured in {genre}</h3>
        <span>{books.length > 0 ? `${books.length} recommendations` : ''}</span>
      </div>

      {loading && (
        <div className="genre-loading">
          <div className="genre-loading-spinner" />
          <p>Curating recommendations for {genre}...</p>
        </div>
      )}

      {error && !loading && (
        <div className="genre-empty">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <div className="genre-empty">
          <p>No books found for this shelf. Try another genre above!</p>
        </div>
      )}

      {!loading && books.length > 0 && (
        <div className="genre-books-grid">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onViewDetails={onSelectBook}
            />
          ))}
        </div>
      )}
    </div>
  );
}
