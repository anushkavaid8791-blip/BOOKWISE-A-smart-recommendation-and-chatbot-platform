import React from 'react';
import { X, Heart, BookOpen } from './Icons';
import { useAuth } from '../context/AuthContext';
import './WishlistModal.css';

export default function WishlistModal({ onClose, onReadBook }) {
  const { wishlist, removeFromWishlist } = useAuth();

  return (
    <div className="wishlist-modal-backdrop" onClick={onClose}>
      <div className="wishlist-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wishlist-modal-header">
          <h3>
            <Heart size={20} fill="#c9724d" color="#c9724d" />
            My Wishlist ({wishlist?.length || 0})
          </h3>
          <button className="wishlist-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="wishlist-modal-body">
          {!wishlist || wishlist.length === 0 ? (
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon">📚</div>
              <h4>Your shelf is waiting</h4>
              <p>
                Click the heart icon on any book across BookWise to save it here for later reading.
              </p>
            </div>
          ) : (
            <div className="wishlist-items-list">
              {wishlist.map((book, idx) => {
                const cover = book.coverUrl || book.coverImage ||
                  (book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null) ||
                  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=200&q=80';

                return (
                  <div key={book._id || idx} className="wishlist-item">
                    <img src={cover} alt={book.title} className="wishlist-item-cover" />
                    
                    <div className="wishlist-item-info">
                      <h4 className="wishlist-item-title" title={book.title}>
                        {book.title}
                      </h4>
                      <p className="wishlist-item-author">
                        by {book.author || 'Unknown Author'}
                      </p>
                    </div>

                    <div className="wishlist-item-actions">
                      <button
                        className="wishlist-read-btn"
                        onClick={() => {
                          if (onReadBook) onReadBook(book);
                        }}
                      >
                        Read
                      </button>

                      <button
                        className="wishlist-delete-btn"
                        onClick={() => removeFromWishlist(book._id || book.bookId, book.title)}
                        title="Remove from wishlist"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
