
import "./GoogleButton.css";

export default function GoogleButton({ onClick, loading }) {
  return (
    <button className="google-btn" onClick={onClick} disabled={loading}>
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google Icon"
        className="google-icon"
        style={{ width: "18px", height: "18px" }}
      />
      <span style={{ flex: 1 }}>
        {loading ? "Redirecting..." : "Continue with Google"}
      </span>
      {!loading && <span className="arrow">→</span>}
    </button>
  );
}
