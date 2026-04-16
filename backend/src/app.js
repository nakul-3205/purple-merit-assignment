require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security headers ───────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ── Global rate limit ─────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ── Parsers ────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── HTTP request logger ────────────────────────────
const morganStream = { write: (msg) => logger.http(msg.trim()) };
app.use(morgan('[:date[iso]] :method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// ── Health check ───────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API routes ─────────────────────────────────────
app.use('/api', routes);

// ── 404 handler ────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` }));

// ── Global error handler ───────────────────────────
app.use(errorHandler);

module.exports = app;
