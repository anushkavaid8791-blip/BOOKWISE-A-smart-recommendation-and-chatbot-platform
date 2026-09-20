import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import TrendingBooks from '../components/TrendingBooks';
import './HomePage.css';

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
  };

  return (
    <div className="home-page">
      <Navbar />
      
      <main className="home-main">
        <div className="container">
          
          {/* Trending Books Section */}
          <section className="trending-section">
            <TrendingBooks />
          </section>

          {/* Genre Selector Section */}
          <section className="genre-section">
            <GenreSelector onGenreSelect={handleGenreSelect} />
          </section>

          {/* Genre-Based Recommendations */}
          {selectedGenre && (
            <section className="recommendations-section">
              <GenreBasedRecommend genre={selectedGenre} />
            </section>
          )}

          {/* Favorite Authors Section */}
          <section className="authors-section">
            <FavoriteAuthors />
          </section>

        </div>
      </main>
    </div>
  );
}