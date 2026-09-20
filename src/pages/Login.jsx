import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import GoogleButton from "../components/GoogleButton";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        navigate("/");
      } else {
        setError(res.error || "Could not sign in with Google. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred during sign-in.");
    } finally {
      setLoading(false);
    }
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

          {error && (
            <p style={{ color: '#d9534f', fontSize: '13px', marginBottom: '16px', background: '#ffebee', padding: '10px', borderRadius: '6px' }}>
              {error}
            </p>
          )}

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
