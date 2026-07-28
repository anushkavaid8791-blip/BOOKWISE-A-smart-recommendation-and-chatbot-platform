import { useState } from "react";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import "./Signup.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <Logo />
        <h1>Create your account</h1>
        <p className="signup-subtext">Join BookWise and find your next read.</p>

        <form onSubmit={handleEmailSignup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button className="google-btn" onClick={handleGoogleSignIn}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="btn-icon"
          />
          Continue with Google
        </button>

        <p className="switch-auth">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}