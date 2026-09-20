import React, { useState } from 'react';
import './GenreSelector.css';

const GENRES = [
  { id: 'fiction', label: 'Fiction', icon: '📖' },
  { id: 'mystery', label: 'Mystery & Thriller', icon: '🔍' },
  { id: 'romance', label: 'Romance', icon: '❤️' },
  { id: 'fantasy', label: 'Fantasy & Sci-Fi', icon: '✨' },
  { id: 'scifi', label: 'Speculative Fiction', icon: '🚀' },
  { id: 'philosophy', label: 'Philosophy', icon: '🏛️' },
  { id: 'classics', label: 'Literary Classics', icon: '🖋️' },
  { id: 'cozy', label: 'Cozy Reads', icon: '☕' }
];

export default function GenreSelector({ onGenreSelect }) {
  const [activeGenre, setActiveGenre] = useState(null);

  const handleClick = (genreId) => {
    const nextGenre = activeGenre === genreId ? null : genreId;
    setActiveGenre(nextGenre);
    if (onGenreSelect) {
      onGenreSelect(nextGenre);
    }
  };

  return (
    <div className="genre-selector">
      <div className="genre-header">
        <h2>Explore by Genre</h2>
        <p>Select a shelf to uncover handpicked stories tailored to your interests.</p>
      </div>

      <div className="genre-chips">
        {GENRES.map((g) => (
          <button
            key={g.id}
            className={`genre-chip ${activeGenre === g.id ? 'active' : ''}`}
            onClick={() => handleClick(g.id)}
          >
            <span className="genre-chip-icon">{g.icon}</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
