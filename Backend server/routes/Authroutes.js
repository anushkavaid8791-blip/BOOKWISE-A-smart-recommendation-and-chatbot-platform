// routes/authRoutes.js

import express from 'express';
import { googleSignIn, getCurrentUser, logout } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/google — Google Sign-in token verify karke login/signup
router.post('/google', googleSignIn);

// GET /api/auth/me — current logged-in user ka data (protected route)
router.get('/me', authMiddleware, getCurrentUser);

// POST /api/auth/logout — logout confirmation (protected route)
router.post('/logout', authMiddleware, logout);

export default router;