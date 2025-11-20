// Load .env BEFORE anything else
import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// (keep the rest of your imports below…)
import paymentRoutesHandler from './routes/paymentRoutes.js';
// If you have AI routes, import them too:
import aiRoutes from './routes/aiRoutes.js';
import refundRoutes from './routes/refundRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// basic middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // payments frontend
    'http://localhost:3000'  // sath-villa frontend
  ],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());

// routes
app.use('/api/payments', paymentRoutesHandler);
app.use('/stripe', paymentRoutesHandler); // Add stripe routes
app.use('/checkout', paymentRoutesHandler); // Add checkout routes
app.use('/api/ai', aiRoutes);
app.use('/api/refunds', refundRoutes);

// health log (temporary)
console.log('GEMINI_API_KEY loaded?', !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()));

app.get('/api/payments/health', (req, res) => res.json({
  ok: true, 
  time: new Date(),
  expectsHeader: 'Authorization: Bearer user-secret-token',
  alsoAcceptsQueryToken: '?token=user-secret-token'
}));

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message || 'Internal Server Error' });
});

// DB + server
mongoose.connect(MONGO_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch((err) => console.error('❌ MongoDB connection error:', err));