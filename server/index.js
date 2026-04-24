require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const rateLimit  = require('express-rate-limit');
const helmet     = require('helmet');

const userRoutes    = require('./routes/user');
const processRoutes = require('./routes/process');
const timelineRoutes = require('./routes/timeline');
const chatRoutes    = require('./routes/chat');
const voterRoutes   = require('./routes/voter');

const app    = express();
const PORT   = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ── Security headers (BUG-fix: CSP) ─────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],   // Vite needs this in dev
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'", 'https://api.openai.com'],
    },
  },
  crossOriginEmbedderPolicy: false,  // allows external font loading
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = isProd
  ? [process.env.CLIENT_URL].filter(Boolean)   // set CLIENT_URL in Cloud Run
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || !isProd) return cb(null, true);  // allow all in dev
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS not allowed'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50kb' }));  // prevent oversized payloads

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Global: 120 requests/min per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

// Chat: 20 messages/min (streaming is expensive)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Chat rate limit reached. Please wait a moment.' },
});

app.use(globalLimiter);
app.use('/api/chat', chatLimiter);

// ── API Routes ────────────────────────────────────────────────────────────────
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
  app.get('*', (req, res) =>
    res.sendFile(path.join(distPath, 'index.html'))
  );
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Don't leak stack traces in production
  const message = isProd ? 'Internal Server Error' : err.message;
  res.status(err.status || 500).json({ error: message });
});

// ── Start server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB connected');
    } else {
      console.log('⚠️  No MONGO_URI — running with in-memory fallbacks');
    }
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
  }
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`🚀 ElectPath on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`)
  );
};

startServer();
