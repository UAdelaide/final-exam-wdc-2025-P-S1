const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing) - Enhanced for debugging
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role, password_hash FROM Users');
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST setup test data (for easy testing)
router.post('/setup-test-data', async (req, res) => {
  try {
    // Clear existing test data
    await db.query('DELETE FROM WalkRatings');
    await db.query('DELETE FROM WalkApplications');
    await db.query('DELETE FROM WalkRequests');
    await db.query('DELETE FROM Dogs');
    await db.query('DELETE FROM Users');

    // Insert test users
    await db.query(`
      INSERT INTO Users (username, email, password_hash, role) VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner'),
      ('tom123', 'tom@example.com', 'hashed321', 'walker'),
      ('rachel123', 'rachel@example.com', 'hashed654', 'owner')
    `);

    // Insert test dogs
    await db.query(`
      INSERT INTO Dogs (name, size, owner_id) VALUES
      ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
      ('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
      ('Ben', 'large', (SELECT user_id FROM Users WHERE username = 'rachel123')),
      ('Harry', 'small', (SELECT user_id FROM Users WHERE username = 'alice123')),
      ('Simon', 'medium', (SELECT user_id FROM Users WHERE username = 'rachel123'))
    `);

    res.json({ message: 'Test data created successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Failed to setup test data' });
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
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET current user session
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login with enhanced debugging
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt:', { username, password }); // Debug log

  try {
    // First, let's see what users exist
    const [allUsers] = await db.query('SELECT username, password_hash, role FROM Users');
    console.log('All users in database:', allUsers); // Debug log

    const [rows] = await db.query(`
      SELECT user_id, username, email, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    console.log('Login query result:', rows); // Debug log

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        debug: 'Username or password does not match'
      });
    }

    const user = rows[0];

    // Store user in session
    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    console.log('Login successful for:', user.username); // Debug log

    // Return success with role for frontend redirection
    res.json({
      message: 'Login successful',
      user: user,
      redirect: user.role === 'owner' ? '/owner-dashboard.html' : '/walker-dashboard.html'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;