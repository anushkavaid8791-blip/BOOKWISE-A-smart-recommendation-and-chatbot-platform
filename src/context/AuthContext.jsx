import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithGoogle as firebaseGoogleSignIn } from '../firebase';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || localStorage.getItem('authToken'));
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('bookwise_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const res = await authAPI.getCurrentUser();
          if (res?.user) {
            setUser(res.user);
            if (Array.isArray(res.user.wishlist) && res.user.wishlist.length > 0) {
              setWishlist(res.user.wishlist);
              try {
                localStorage.setItem('bookwise_wishlist', JSON.stringify(res.user.wishlist));
              } catch {}
            }
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const firebaseUser = await firebaseGoogleSignIn();
      const idToken = await firebaseUser.getIdToken();
      const data = await authAPI.googleSignIn(idToken);

      const authToken = data.token;
      const loggedUser = data.user;

      localStorage.setItem('token', authToken);
      localStorage.setItem('authToken', authToken);
      setToken(authToken);
      setUser(loggedUser);
      
      const serverWishlist = loggedUser?.wishlist || [];
      const mergedWishlist = [...wishlist];
      serverWishlist.forEach(sb => {
        if (!mergedWishlist.some(w => w.title === sb.title)) {
          mergedWishlist.push(sb);
        }
      });
      setWishlist(mergedWishlist);
      try {
        localStorage.setItem('bookwise_wishlist', JSON.stringify(mergedWishlist));
      } catch {}

      return { success: true, user: loggedUser };
    } catch (err) {
      console.error('Login failed:', err);
      return { success: false, error: err.message || 'Google sign-in failed' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout().catch(() => {});
      }
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  };

  const toggleWishlist = async (book) => {
    if (!book) return { success: false };
    const bookId = book._id || book.id || book.isbn || book.title;
    const exists = wishlist.some(
      (b) => (b._id && b._id === bookId) || (b.bookId && b.bookId === bookId) || (b.title && b.title === book.title)
    );

    let updatedList;
    let isWishlisted;
    if (exists) {
      updatedList = wishlist.filter(
        (b) => !((b._id && b._id === bookId) || (b.bookId && b.bookId === bookId) || (b.title && b.title === book.title))
      );
      isWishlisted = false;
    } else {
      const newEntry = {
        _id: bookId,
        bookId: bookId,
        title: book.title,
        author: book.author || 'Unknown Author',
        coverUrl: book.coverUrl || book.coverImage || '',
        avgRating: book.avgRating || book.averageRating || 4.8,
        description: book.description || book.reason || '',
        addedAt: new Date().toISOString()
      };
      updatedList = [newEntry, ...wishlist];
      isWishlisted = true;
    }

    setWishlist(updatedList);
    try {
      localStorage.setItem('bookwise_wishlist', JSON.stringify(updatedList));
    } catch {}

    if (token) {
      userAPI.toggleWishlist(book).catch((err) => console.warn('Wishlist cloud sync error:', err.message));
    }

    return { success: true, isWishlisted, wishlist: updatedList };
  };

  const removeFromWishlist = async (bookId, title) => {
    const updatedList = wishlist.filter(
      (b) => !((bookId && (b._id === bookId || b.bookId === bookId)) || (title && b.title === title))
    );
    setWishlist(updatedList);
    try {
      localStorage.setItem('bookwise_wishlist', JSON.stringify(updatedList));
    } catch {}
    if (token && bookId) {
      userAPI.removeFromWishlist(bookId).catch(() => {});
    }
  };

  const isBookWishlisted = (bookId, title) => {
    return wishlist.some(
      (b) => (bookId && (b.bookId === bookId || b._id === bookId)) || (title && b.title === title)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        loginWithGoogle,
        logout,
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        isBookWishlisted
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
