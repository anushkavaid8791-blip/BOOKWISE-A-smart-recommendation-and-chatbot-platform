
// import "./GoogleButton.css";

// export default function GoogleButton({ onClick, loading }) {
//   return (
//     <button className="google-btn" onClick={onClick} disabled={loading}>
//       <img
//         src="https://www.svgrepo.com/show/475656/google-color.svg"
//         alt="Google Icon"
//         className="google-icon"
//         style={{ width: "18px", height: "18px" }}
//       />
//       <span style={{ flex: 1 }}>
//         {loading ? "Redirecting..." : "Continue with Google"}
//       </span>
//       {!loading && <span className="arrow">→</span>}
//     </button>
//   );
// }
import { signInWithGoogle } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./GoogleButton.css";

function GoogleButton() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();

      console.log("User:", user);
      alert(`Welcome ${user.displayName}`);

      // Redirect after login
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Google Sign-In Failed");
    }
  };

  return (
    <button className="google-button" onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
}

export default GoogleButton;