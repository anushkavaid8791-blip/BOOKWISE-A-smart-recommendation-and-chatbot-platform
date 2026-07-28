import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAElbxpvjTjn9_ltz2LdlO7j9Jnw1I4nMk",
  authDomain: "mern-project-bookwise.firebaseapp.com",
  projectId: "mern-project-bookwise",
  storageBucket: "mern-project-bookwise.firebasestorage.app",
  messagingSenderId: "1073391795096",
  appId: "1:1073391795096:web:af6ee0995aa04e721409ed",
  measurementId: "G-GNZEL4S0JT",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  return result.user; // { displayName, email, photoURL, uid, ... }
};