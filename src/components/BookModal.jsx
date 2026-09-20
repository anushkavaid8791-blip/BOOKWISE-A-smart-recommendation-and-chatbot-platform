import React from 'react';
import { X, Heart, Star } from './Icons';
import { useAuth } from '../context/AuthContext';
import './BookModal.css';

export default function BookModal({ book, onClose, onReadBook }) {
  const { toggleWishlist, isBookWishlisted } = useAuth();

  if (!book) return null;

  const bookId = book._id || book.id || book.isbn;
  const isWishlisted = isBookWishlisted ? isBookWishlisted(bookId, book.title) : false;

  const coverSrc = book.coverUrl || book.coverImage ||
    (book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg` : null) ||
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80';

  const handleWishlist = async () => {
    if (toggleWishlist) {
      await toggleWishlist(book);
    }
  };

  return (
    <div className="book-modal-backdrop" onClick={onClose}>
      <div className="book-modal" onClick={(e) => e.stopPropagation()}>
        <button className="book-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="book-modal-content">
          <div className="book-modal-cover-wrapper">
            <img src={coverSrc} alt={book.title} className="book-modal-cover" />
          </div>

          <div className="book-modal-details">
            <h2 className="book-modal-title">{book.title}</h2>
            <p className="book-modal-author">by {book.author || 'Unknown Author'}</p>

            <div className="book-modal-meta">
              <div className="book-modal-rating">
                <Star size={18} fill="#c9a961" />
                <span>{book.avgRating || book.averageRating || '4.8'} / 5.0</span>
              </div>
            </div>

            <p className="book-modal-desc">
              {book.description || book.reason ||
                'Immerse yourself in this timeless literary work. Experience the rich character development, masterfully crafted prose, and unforgettable atmosphere that makes this title beloved by readers worldwide.'}
            </p>

            <div className="book-modal-actions">
              <button
                className="book-modal-read-btn"
                onClick={() => {
                  onClose();
                  if (onReadBook) onReadBook(book);
                }}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #c9724d, #a65236)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  flex: 1
                }}
              >
                📖 Read Book
              </button>

              <button
                className={`book-modal-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlist}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                {isWishlisted ? 'Saved' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
