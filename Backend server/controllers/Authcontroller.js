// controllers/authController.js
// Google Sign-in verify karta h aur apna JWT token banata h

import jwt from 'jsonwebtoken';
import admin from '../config/firebase.js';
import User from '../models/User.js';

// Apna JWT banane ka helper
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * POST /api/auth/google
 * Frontend se Firebase ID token aata h, verify karke user create/login karta h
 */
export const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token zaroori h' });
    }

    // ===== 1. Firebase se token verify karo =====
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // ===== 2. User already exist karta h ya naya banao =====
    let user = await User.findOne({ googleId: uid });

    if (!user) {
      // Naya user — pehli baar sign-in kar raha h
      user = await User.create({
        googleId: uid,
        email,
        name: name || email.split('@')[0],
        profilePicture: picture || null,
        isVerified: true
      });
    } else {
      // Purana user — last login update karo
      user.lastLogin = new Date();
      await user.save();
    }

    // ===== 3. Apna JWT generate karo =====
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Sign-in successful',
      token,
      user
    });
  } catch (err) {
    console.error('❌ Google Sign-in Error:', err.message);
    res.status(401).json({ error: 'Google sign-in fail ho gaya — invalid token' });
  }
};

/**
 * GET /api/auth/me
 * Current logged-in user ka data return karta h (authMiddleware ke baad)
 */
export const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/auth/logout
 * JWT stateless hota h, isliye backend pe sirf confirmation deta h —
 * actual "logout" frontend token delete karke karta h
 */
export const logout = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};