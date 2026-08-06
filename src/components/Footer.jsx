import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-logo">
          <h2>📚 BookWise</h2>
          <p>
            Discover your next favorite book with AI-powered recommendations.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>

          <a href="/">Home</a>
          <a href="/favorites">Favorites</a>
          <a href="/recommend">AI Recommendation</a>
        </div>

        <div className="footer-contact">
          <h3>Contact</h3>

          <p>Email: support@bookwise.com</p>
          <p>Made with ❤️ using React & Firebase</p>
        </div>

      </div>

      <hr />

      <p className="copyright">
        © 2026 BookWise. All Rights Reserved.
      </p>

    </footer>
  );
}

export default Footer;