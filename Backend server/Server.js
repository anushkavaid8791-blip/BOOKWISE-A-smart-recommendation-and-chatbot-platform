// server.js
// Yeh backend ka MAIN FILE h — sab kuch yahin se start hota h
// NOTE: package.json mein "type": "module" h, isliye yahan IMPORT syntax use hoga (require nahi)

// ===== 1. Imports =====
// 🔧 FIX: 'dotenv/config' sabse PEHLI import line honi chahiye.
// ES Modules mein saari imports resolve hone ke baad hi file ka baaki code chalta h —
// agar authRoutes (jo Firebase import karta h) upar likha ho, toh Firebase
// dotenv.config() chalne se PEHLE hi load ho sakta h, isliye .env values undefined milti thi.
// 'dotenv/config' ko sabse top pe rakhne se yeh guaranteed sabse pehle chalta h.
import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dns from 'dns';

// 🔧 FIX: Node ka default DNS resolver kabhi kabhi SRV lookup fail kar deta h
// (especially Reliance/Jio jaise ISPs pe) — Google DNS force karke fix karte h.
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Routes — jaise jaise files banti jayengi, yahan uncomment karte jaana
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';

// ===== 2. App Initialize =====
const app = express();
const PORT = process.env.PORT || 5000;

// ===== 3. Middleware =====
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // React/Vite dev server
  credentials: true
}));
app.use(express.json()); // JSON body parse karne ke liye (req.body kaam karega)
app.use(express.urlencoded({ extended: true }));

// Simple request logger — dev ke liye helpful
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// ===== 4. MongoDB Connect =====
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1); // DB ke bina server chalane ka matlab nahi
  });

// ===== 5. Routes =====
app.get('/', (req, res) => {
  res.json({ message: 'BookWise API is running 📚', status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/recommendations', recommendationRoutes);

// ===== 6. 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== 7. Global Error Handler =====
// Koi bhi route mein error aaye (next(err) call ho), yahan aayega
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong on the server'
  });
});

// ===== 8. Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});