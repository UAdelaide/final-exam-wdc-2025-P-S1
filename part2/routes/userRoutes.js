const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET current user info
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// ADDED: GET dogs belonging to the current logged-in user
router.get('/my-dogs', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    // Get dogs belonging to the current user
    const [rows] = await db.query(`
      SELECT dog_id, name, size
      FROM Dogs
      WHERE owner_id = ?
      ORDER BY name
    `, [req.session.user.user_id]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching user dogs:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

// POST login with session management
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, email, role FROM Users
      WHERE email = ? AND password_hash = ?
    `, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // Store user data in session for persistence across requests
    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    // Ensure session is saved before responding
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }

      // Send success response with role-based redirect URL
      res.json({
        message: 'Login successful',
        user: req.session.user,
        redirectTo: user.role === 'owner' ? '/owner-dashboard.html' : '/walker-dashboard.html'
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST logout with complete session cleanup
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    // Clear the session cookie completely
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: false // Set to true in production with HTTPS
    });

    console.log('User logged out successfully');
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;