import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Search, BookOpen, X } from './Icons';
import { useAuth } from '../context/AuthContext';
import { booksAPI } from '../services/api';
import './Navbar.css';

export default function Navbar({ onOpenWishlist, onSelectBook }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, wishlist } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await booksAPI.search(searchQuery.trim(), 5);
        setSearchResults(Array.isArray(results) ? results : []);
        setShowDropdown(true);
      } catch (err) {
        console.warn('Search query failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (book) => {
    setShowDropdown(false);
    setSearchQuery('');
    if (onSelectBook) {
      onSelectBook(book);
    } else {
      navigate('/');
    }
  };

  const scrollToSection = (sectionClass) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(`.${sectionClass}`);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      const el = document.querySelector(`.${sectionClass}`);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <div className="logo-badge-icon">
            <BookOpen size={20} />
          </div>
          <div className="logo-brand-text">
            <span className="logo-text">BookWise</span>
            <span className="logo-subtext">Literary Sanctuary</span>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div className="navbar-nav-links">
          <span className="nav-link" onClick={() => scrollToSection('trending-section')}>
            Trending
          </span>
          <span className="nav-link" onClick={() => scrollToSection('genre-section')}>
            Genres
          </span>
          <span className="nav-link" onClick={() => scrollToSection('authors-section')}>
            Authors
          </span>
        </div>

        {/* Live Search Bar */}
        <div className="navbar-search" ref={searchRef}>
          <div className="search-box">
            <Search size={16} className="search-icon-svg" />
            <input
              type="text"
              placeholder="Search novels, classics, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((book, idx) => (
                <div
                  key={book._id || idx}
                  className="search-result-item"
                  onClick={() => handleResultClick(book)}
                >
                  <img
                    src={book.coverUrl || book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=100&q=80'}
                    alt={book.title}
                    className="search-result-cover"
                  />
                  <div className="search-result-info">
                    <p className="search-result-title">{book.title}</p>
                    <p className="search-result-author">by {book.author || 'Unknown'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Wishlist & User Profile */}
        <div className="navbar-right">
          <button
            className="wishlist-icon"
            onClick={onOpenWishlist}
            title="My Saved Library"
            aria-label="Open Wishlist"
          >
            <Heart
              size={20}
              fill={wishlist && wishlist.length > 0 ? '#c9724d' : 'none'}
              color={wishlist && wishlist.length > 0 ? '#c9724d' : 'currentColor'}
            />
            {wishlist && wishlist.length > 0 && (
              <span className="wishlist-badge">{wishlist.length}</span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="user-profile-badge">
              <div className="avatar-circle">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <span className="user-greeting">
                Hi, {user?.name ? user.name.split(' ')[0] : 'Reader'}
              </span>
              <button className="logout-btn" onClick={logout} title="Sign Out">
                LOGOUT
              </button>
            </div>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login')}>
              SIGN IN
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}