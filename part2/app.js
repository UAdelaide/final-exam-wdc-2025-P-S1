const express = require('express');
const path = require('path');
const session = require('express-session'); // Added session support
require('dotenv').config();

const app = express();

// Session middleware - Added for login functionality
app.use(session({
  secret: 'dog-walking-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Authentication middleware to protect dashboard routes
function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', requireAuth, walkRoutes); // Protected walk routes
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;