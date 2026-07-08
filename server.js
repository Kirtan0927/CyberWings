require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const session    = require('express-session');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'cyberwings_dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  },
}));

const apiLimiter  = rateLimit({ windowMs: 15*60*1000, max: 100, message: { success: false, message: 'Too many requests.' } });
const formLimiter = rateLimit({ windowMs: 60*60*1000, max: 10,  message: { success: false, message: 'Too many submissions.' } });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

const adminRoutes = require('./routes/admin');

// mount at root because routes already have full paths
app.use('/', adminRoutes);

app.use('/api', apiLimiter);
app.use('/api/members',  require('./routes/members'));
app.use('/api/events',   require('./routes/events'));
app.use('/api/contact',  formLimiter, require('./routes/contact'));
app.use('/api/speakers', formLimiter, require('./routes/speakers'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'The Cyber Wings backend is running', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'File too large. Max 5MB.' });
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔐 Admin panel  → http://localhost:${PORT}/admin/login`);
  console.log(`🔌 API base     → http://localhost:${PORT}/api\n`);
});

module.exports = app;
