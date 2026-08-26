import express from 'express';
import { googleSignIn, getCurrentUser, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/google', googleSignIn);

router.get('/me', verifyToken, getCurrentUser);

router.post('/logout', verifyToken, logout);

export default router;