import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TrendingBooks from '../components/Trendingbooks';
import GenreSelector from '../components/GenreSelector';
import GenreBasedRecommend from '../components/GenreBasedRecommend';
import FavoriteAuthors from '../components/FavoriteAuthors';
import BookModal from '../components/BookModal';
import BookReaderModal from '../components/BookReaderModal';
import WishlistModal from '../components/WishlistModal';
import FloatingChatbot from '../components/chatbot/FloatingChatbot';
import Footer from '../components/Footer';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [activeBook, setActiveBook] = useState(null);
  const [readingBook, setReadingBook] = useState(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
  };

  const handleAuthorSelect = (authorQuery) => {
    navigate(`/recommend?author=${encodeURIComponent(authorQuery)}`);
  };

  return (
    <div className="home">
      {/* Upgraded Navbar with search & wishlist triggers */}
      <Navbar
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onSelectBook={(book) => setActiveBook(book)}
      />

      <main className="home-main">
        <div className="container">
          
          {/* Trending Books Section */}
          <section className="section trending-section">
            <TrendingBooks
              onSelectBook={(book) => setActiveBook(book)}
              onReadBook={(book) => setReadingBook(book)}
            />
          </section>

          {/* Genre Selector Section */}
          <section className="section genre-section">
            <GenreSelector onGenreSelect={handleGenreSelect} />
          </section>

          {/* Genre-Based Recommendations */}
          {selectedGenre && (
            <section className="section recommendations-section">
              <GenreBasedRecommend 
                genre={selectedGenre} 
                onSelectBook={(book) => setActiveBook(book)} 
              />
            </section>
          )}

          {/* Favorite Authors Section */}
          <section className="section authors-section">
            <FavoriteAuthors onSelectAuthor={handleAuthorSelect} />
          </section>

        </div>
      </main>

      {/* Book Details Modal */}
      {activeBook && (
        <BookModal 
          book={activeBook} 
          onClose={() => setActiveBook(null)}
          onReadBook={(book) => setReadingBook(book)}
        />
      )}

      {/* Full Book Reader Modal */}
      {readingBook && (
        <BookReaderModal
          book={readingBook}
          onClose={() => setReadingBook(null)}
        />
      )}

      {/* Wishlist Drawer / Modal */}
      {isWishlistOpen && (
        <WishlistModal
          onClose={() => setIsWishlistOpen(false)}
          onReadBook={(book) => {
            setIsWishlistOpen(false);
            setReadingBook(book);
          }}
        />
      )}

      {/* Cute Floating AI Chatbot in corner */}
      <FloatingChatbot onReadBook={(book) => setReadingBook(book)} />

      <Footer />
    </div>
  );
}

export default Home;
