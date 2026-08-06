import "./BookCard.css";

function BookCard({ book }) {
  return (
    <div className="book-card">
      <img
        src={book.image}
        alt={book.title}
        className="book-image"
      />

      <div className="book-content">
        <h3>{book.title}</h3>

        <p className="author">
          {book.author}
        </p>

        <p className="rating">
          ⭐ {book.rating}
        </p>

        <button className="details-btn">
          View Details
        </button>
      </div>
    </div>
  );
}

export default BookCard;