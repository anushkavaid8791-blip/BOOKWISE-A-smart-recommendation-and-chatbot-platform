import React from 'react';
import { Heart, Star } from './Icons';
import { useAuth } from '../context/AuthContext';
import './BookCard.css';

export default function BookCard({ book, onViewDetails, onAddWishlist }) {
  const { isBookWishlisted, toggleWishlist } = useAuth();
  
  if (!book) return null;

  const bookId = book._id || book.id || book.isbn;
  const isWishlisted = isBookWishlisted ? isBookWishlisted(bookId, book.title) : false;

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (onAddWishlist) {
      onAddWishlist(book);
    } else if (toggleWishlist) {
      await toggleWishlist(book);
    }
  };

  const handleView = () => {
    if (onViewDetails) {
      onViewDetails(book);
    }
  };

  const coverSrc = book.coverUrl || book.coverImage || 
    (book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null) ||
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80';

  const rating = book.avgRating || book.averageRating || 4.5;

  return (
    <div className="book-card">
      <div className="book-image-wrapper" onClick={handleView} style={{ cursor: 'pointer' }}>
        <img 
          src={coverSrc} 
          alt={book.title}
          className="book-image"
          loading="lazy"
        />
        <button 
          className="wishlist-btn"
          onClick={handleWishlist}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label="Wishlist button"
          style={isWishlisted ? { color: '#c9724d' } : {}}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="book-content">
        <h3 className="book-title" title={book.title} onClick={handleView} style={{ cursor: 'pointer' }}>
          {book.title}
        </h3>
        <p className="book-author">{book.author || 'Unknown Author'}</p>
        
        <div className="book-rating">
          <Star size={15} className="star-icon" fill="#c9a961" />
          <span>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
          {book.reason && (
            <span style={{ fontSize: '11px', color: '#888', marginLeft: 'auto', fontStyle: 'italic' }}>
              Curated Pick
            </span>
          )}
        </div>

        <button 
          className="view-details-btn"
          onClick={handleView}
        >
          VIEW DETAILS
        </button>
      </div>
    </div>
  );
}