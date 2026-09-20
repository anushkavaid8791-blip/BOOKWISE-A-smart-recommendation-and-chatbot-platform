import React, { useState, useEffect } from 'react';
import { X, BookOpen } from './Icons';
import { booksAPI } from '../services/api';
import './BookReaderModal.css';

export default function BookReaderModal({ book, onClose }) {
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(17);
  const [theme, setTheme] = useState('sepia'); // 'sepia' | 'white' | 'dark'

  useEffect(() => {
    if (!book) return;

    let isMounted = true;
    setLoading(true);

    booksAPI.getReadContent(book.title, book.author)
      .then((data) => {
        if (isMounted) {
          setContentData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Error fetching read content:', err);
          setContentData({
            title: book.title,
            author: book.author,
            chapterTitle: 'Opening Chapter',
            content: book.description || 'Welcome to the pages of this book. Experience the rich world and memorable characters within.',
            source: 'BookWise Archive'
          });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [book]);

  if (!book) return null;

  const paragraphs = contentData?.content ? contentData.content.split('\n\n') : [];

  return (
    <div className="reader-backdrop" onClick={onClose}>
      <div
        className={`reader-window reader-theme-${theme}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="reader-header">
          <div className="reader-book-info">
            <h3>{book.title}</h3>
            <p>by {book.author || 'Classic Author'}</p>
          </div>

          <div className="reader-toolbar">
            {/* Font Size Adjusters */}
            <button
              className="reader-btn"
              onClick={() => setFontSize((s) => Math.max(14, s - 1))}
              title="Decrease text size"
            >
              A-
            </button>
            <button
              className="reader-btn"
              onClick={() => setFontSize((s) => Math.min(24, s + 1))}
              title="Increase text size"
            >
              A+
            </button>

            {/* Theme Selector */}
            <div className="reader-theme-selector">
              <div
                className={`theme-pill pill-sepia ${theme === 'sepia' ? 'active' : ''}`}
                onClick={() => setTheme('sepia')}
                title="Sepia parchment mode"
              />
              <div
                className={`theme-pill pill-white ${theme === 'white' ? 'active' : ''}`}
                onClick={() => setTheme('white')}
                title="White daylight mode"
              />
              <div
                className={`theme-pill pill-dark ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                title="Night reading mode"
              />
            </div>

            {/* Close Button */}
            <button className="reader-close" onClick={onClose} aria-label="Close reader">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Reader Body */}
        <div className="reader-body" style={{ fontSize: `${fontSize}px` }}>
          {loading ? (
            <div className="reader-loading">
              <div className="reader-spinner" />
              <p>Opening pages of "{book.title}"...</p>
            </div>
          ) : (
            <div>
              <div className="reader-chapter-title">
                {contentData?.chapterTitle || 'Chapter I'}
              </div>

              {paragraphs.map((p, idx) => (
                <p key={idx} className="reader-paragraph">
                  {p.trim()}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Reader Footer */}
        <div className="reader-footer">
          <span>
            {contentData?.source ? `Source: ${contentData.source}` : 'BookWise Reader'}
          </span>
          {contentData?.gutenbergUrl && (
            <a
              href={contentData.gutenbergUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="reader-gutenberg-link"
            >
              Open Complete Gutenberg Ebook ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
