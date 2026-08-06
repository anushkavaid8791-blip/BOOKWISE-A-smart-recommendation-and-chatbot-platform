
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config(); 

dns.setServers(['8.8.8.8', '8.8.4.4']);

// Routes — jaise jaise files banti jayengi, yahan uncomment karte jaana
// import authRoutes from './routes/authRoutes.js';           // 🔜 abhi nahi bani
// import userRoutes from './routes/userRoutes.js';           // 🔜 abhi nahi bani
// import bookRoutes from './routes/bookRoutes.js';           // 🔜 abhi nahi bani
// import recommendationRoutes from './routes/recommendationRoutes.js'; // 🔜 abhi nahi bani

//  App Initialize 
const app = express();
const PORT = process.env.PORT || 5000;

//  Middleware 
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // React/Vite dev server
  credentials: true
}));
app.use(express.json()); // JSON body parse karne ke liye (req.body kaam karega)
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

//  MongoDB Connect =
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1); // DB ke bina server chalane ka matlab nahi
  });

//  Routes 
app.get('/', (req, res) => {
  res.json({ message: 'BookWise API is running 📚', status: 'ok' });
});

// app.use('/api/auth', authRoutes);                     // 🔜 authRoutes.js banne ke baad uncomment karo
// app.use('/api/users', userRoutes);                    // 🔜 userRoutes.js banne ke baad uncomment karo
// app.use('/api/books', bookRoutes);                    // 🔜 bookRoutes.js banne ke baad uncomment karo
// app.use('/api/recommendations', recommendationRoutes); // 🔜 recommendationRoutes.js wire karne ke baad

//  404 Handler 
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
})
//  start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});