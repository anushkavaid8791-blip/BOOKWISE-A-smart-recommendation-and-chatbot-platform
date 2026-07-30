import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      alert("Logged Out Successfully");

      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Welcome to BookWise 📚</h1>

      <button onClick={handleLogout}>
        
        Logout
      </button>
    </div>
  );
}

export default Home;