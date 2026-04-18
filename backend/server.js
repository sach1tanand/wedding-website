require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const connectDB = require('./config/db');

const app = express();
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');

connectDB().catch((error) => {
  console.error('Database startup failed:', error.message);
  if (process.env.NODE_ENV === 'production') process.exit(1);
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(compression());


app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { error: 'Upload limit reached. Try again in an hour.' },
});

const rsvpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'RSVP already submitted. Max 5 per hour per IP.' },
});

app.use(globalLimiter);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use('/api/events', require('./routes/events'));
app.use('/api/rsvp', rsvpLimiter, require('./routes/rsvp'));
app.use('/api/wishes', require('./routes/wishes'));
app.use('/api', uploadLimiter, require('./routes/images'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/admin', require('./routes/admin'));


app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Wedding API is live',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});


app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nWedding app running on port ${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
