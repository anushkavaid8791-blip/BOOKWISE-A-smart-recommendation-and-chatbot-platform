import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BookCard from "../components/BookCard";
import Footer from "../components/Footer";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  // Dummy books (Later Google Books API se replace karenge)
  const books = [
    {
      title: "Atomic Habits",
      author: "James Clear",
      image: "https://m.media-amazon.com/images/I/91bYsX41DVL.jpg",
      rating: "4.8",
    },
    {
      title: "The Alchemist",
      author: "Paulo Coelho",
      image: "https://m.media-amazon.com/images/I/71aFt4+OTOL.jpg",
      rating: "4.6",
    },
    {
      title: "Harry Potter",
      author: "J.K. Rowling",
      image: "https://m.media-amazon.com/images/I/81YOuOGFCJL.jpg",
      rating: "4.9",
    },
  ];

  const categories = [
    "Fiction",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Self Help",
    "Technology",
  ];

  return (
    <div className="home">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Your Next Favourite Book 📚</h1>

          <p>
            Search millions of books and get AI-powered recommendations based
            on your interests.
          </p>

          <div className="search">
            <input
              type="text"
              placeholder="Search books, authors or genres..."
            />

            <button>🔍 Search</button>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="featured">
        <h2>Featured Books</h2>

        <div className="books-container">
          {books.map((book, index) => (
            <BookCard key={index} book={book} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <h2>Browse Categories</h2>

        <div className="category-list">
          {categories.map((category, index) => (
            <button key={index}>{category}</button>
          ))}
        </div>
      </section>

      {/* AI Recommendation */}
      <section className="ai-box">
        <h2>🤖 AI Book Recommendation</h2>

        <p>
          Tell BookWise your mood, favourite genre, or reading goal and let AI
          recommend the perfect books for you.
        </p>

        <button onClick={() => navigate("/recommend")}>
          Try AI Recommendation
        </button>
      </section>

      <Footer />
    </div>
  );
}

export default Home;