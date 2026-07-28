import { useState } from "react";
import Logo from "../components/Logo";
import GoogleButton from "../components/GoogleButton";
import "./Login.css";


// Backend base URL — set this in your .env file as VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setLoading(true);
    // Redirects to your Express + Passport (or Firebase) Google OAuth route.
    // Backend should redirect back to the frontend with a session/JWT set.
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="login">
      {/* ---------- Left: hero panel ---------- */}
      <section className="login__hero">
        <div className="login__hero-overlay" />

        <header className="login__hero-top">
          <Logo variant="light" />
        </header>

        <div className="login__hero-content">
          <p className="login__eyebrow">— The Novel Library —</p>
          <h1 className="login__hero-title">
            A quiet room, full of the world&rsquo;s stories.
          </h1>
          <p className="login__hero-text">
            Discover novels curated from Project Gutenberg. Read, wishlist,
            and chat with your literary companion — matched to your mood.
          </p>
        </div>
      </section>

      {/* ---------- Right: sign-in panel ---------- */}
      <section className="login__panel">
        <div className="login__panel-inner">
          <p className="login__meta">Est. 2026 · Volume I</p>

          <h2 className="login__title">Welcome, reader.</h2>
          <p className="login__subtitle">
            Sign in with Google to enter your personal library. Your
            wishlist, favorite authors, and reading streak travel with you.
          </p>

          <GoogleButton onClick={handleGoogleSignIn} loading={loading} />

          <p className="login__footnote">
            By continuing you accept our reader&rsquo;s code —
            <br />
            treat every book with care.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
