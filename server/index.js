require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const userRoutes    = require('./routes/user');
const processRoutes = require('./routes/process');
const timelineRoutes = require('./routes/timeline');
const chatRoutes    = require('./routes/chat');
const voterRoutes   = require('./routes/voter');

const app  = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: isProd ? '*' : (process.env.CLIENT_URL || 'http://localhost:5173'),
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/user',     userRoutes);
app.use('/api/process',  processRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/voter',    voterRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  timestamp: new Date(),
  env: isProd ? 'production' : 'development',
}));

// ── Serve static frontend in production ───────────────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  // SPA fallback — all non-API routes serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Connect to MongoDB & start server
const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB connected');
    } else {
      console.log('⚠️  No MONGO_URI — running with in-memory fallbacks');
    }
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 ElectPath server on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`)
    );
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 ElectPath server on http://0.0.0.0:${PORT} (no DB)`)
    );
  }
};

startServer();
