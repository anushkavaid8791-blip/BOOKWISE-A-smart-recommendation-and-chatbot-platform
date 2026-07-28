import "./GoogleButton.css";

export default function GoogleButton({ onClick, loading }) {
  return (
    <button className="google-btn" onClick={onClick} disabled={loading}>
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="google-icon"
      />
      <span>{loading ? "Redirecting..." : "Continue with Google"}</span>
      {!loading && <span className="arrow">→</span>}
    </button>
  );
}