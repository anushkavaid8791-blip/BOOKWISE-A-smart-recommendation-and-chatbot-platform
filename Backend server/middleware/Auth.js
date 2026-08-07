// middleware/auth.js
// Protected routes ke liye — request ke saath aaye JWT token ko verify karta h

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Header format: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token nahi mila — login zaroori h' });
    }

    const token = authHeader.split(' ')[1];

    // Token verify karo — agar galat/expired h toh yahin error throw ho jayega
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User ko DB se fetch karo aur request object mein attach karo
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User nahi mila' });
    }

    req.user = user; // ab aage ke route handlers mein req.user use kar sakte h
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expire ho gaya, dobara login karo' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default authMiddleware;