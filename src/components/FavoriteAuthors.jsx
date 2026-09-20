import React from 'react';
import './FavoriteAuthors.css';

const FEATURED_AUTHORS = [
  {
    name: 'Jane Austen',
    genre: 'Classic Romance & Satire',
    works: 'Pride and Prejudice, Sense and Sensibility, Emma',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
    searchQuery: 'Jane Austen'
  },
  {
    name: 'George Orwell',
    genre: 'Dystopian & Political Fiction',
    works: '1984, Animal Farm, Homage to Catalonia',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    searchQuery: 'George Orwell'
  },
  {
    name: 'Charlotte Brontë',
    genre: 'Gothic Fiction & Romance',
    works: 'Jane Eyre, Villette, The Professor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    searchQuery: 'Charlotte Bronte'
  },
  {
    name: 'F. Scott Fitzgerald',
    genre: 'Jazz Age Fiction & Tragedy',
    works: 'The Great Gatsby, Tender Is the Night, This Side of Paradise',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    searchQuery: 'Scott Fitzgerald'
  }
];

export default function FavoriteAuthors({ onSelectAuthor }) {
  return (
    <div className="authors-container">
      <div className="authors-header">
        <h2>Favorite Authors</h2>
        <p>Master storytellers whose pages have shaped generations of readers.</p>
      </div>

      <div className="authors-grid">
        {FEATURED_AUTHORS.map((author) => (
          <div key={author.name} className="author-card">
            <img
              src={author.avatar}
              alt={author.name}
              className="author-avatar"
            />
            <h3 className="author-name">{author.name}</h3>
            <span className="author-genre">{author.genre}</span>
            <p className="author-works"><strong>Key Works:</strong> {author.works}</p>
            <button
              className="author-btn"
              onClick={() => onSelectAuthor && onSelectAuthor(author.searchQuery)}
            >
              Explore Works
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
