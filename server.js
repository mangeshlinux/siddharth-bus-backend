require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const paymentRoutes = require('./routes/payments');
const noticeRoutes = require('./routes/notices');
const schoolRoutes = require('./routes/schools');
const fleetRoutes = require('./routes/fleet');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB Atlas ───
connectDB();

// ─── Middleware ───
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://siddharth-bus.vercel.app', // Production frontend
    /\.vercel\.app$/                     // Any Vercel preview deployments
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increase limit for bulk imports

// ─── API Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/fleet', fleetRoutes);

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Siddharth School Bus & Travels API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ─── Owner Config (Public — used by frontend for display) ───
app.get('/api/config', (req, res) => {
  res.json({
    name: 'Siddharth Shardul',
    businessName: 'Siddharth School Bus & Travels',
    primaryPhone: '8767948553',
    whatsappNumber: '918767948553',
    email: 'siddharth.travels.nashik@gmail.com',
    officeAddress: 'Shop No. 4, Shree Samarth Plaza, Near College Road, Nashik - 422005',
    estYear: '2017',
    city: 'Nashik'
  });
});

// ─── 404 Fallback ───
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log(`\n🚌 Siddharth School Bus API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   CORS allowed: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
});
