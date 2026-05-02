require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const rateLimit  = require('express-rate-limit');
const helmet     = require('helmet');
const compression = require('compression');

const userRoutes    = require('./routes/user');
const processRoutes = require('./routes/process');
const timelineRoutes = require('./routes/timeline');
const chatRoutes    = require('./routes/chat');
const voterRoutes   = require('./routes/voter');

const app    = express();
const PORT   = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ── Compression (Efficiency) ──────────────────────────────────────────────────
app.use(compression());

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com', 'https://www.google-analytics.com'],
      styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:      ["'self'", 'data:', 'blob:', 'https://www.google-analytics.com'],
      connectSrc:  ["'self'", 'https://api.openai.com', 'https://api.allorigins.win',
                    'https://www.google-analytics.com', 'https://region1.google-analytics.com'],
      frameSrc:    ["'none'"],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: isProd ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy:            { policy: 'strict-origin-when-cross-origin' },
  hsts:                      isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://electpath-62772444399.us-central1.run.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// ── Trust Proxy (Cloud Run / load balancers) ──────────────────────────────────
app.set('trust proxy', 1);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: 'Too many requests. Please slow down.' },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  validate: { xForwardedForHeader: false },
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

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    env:       isProd ? 'production' : 'development',
    version:   process.env.npm_package_version || '1.0.0',
  });
});

// ── Serve static frontend in production ───────────────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, '../client/dist');
  // Cache static assets for 1 year, HTML for 0 (SPA routing)
  app.use(express.static(distPath, {
    maxAge:  '1y',
    etag:    true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  }));
  app.get('*', (req, res) =>
    res.sendFile(path.join(distPath, 'index.html'))
  );
}

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status  = err.status || 500;
  const message = isProd ? 'Internal Server Error' : err.message;
  console.error(`[${new Date().toISOString()}] ${status} ${req.method} ${req.path} — ${err.message}`);
  res.status(status).json({ error: message });
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

module.exports = app; // export for testing
