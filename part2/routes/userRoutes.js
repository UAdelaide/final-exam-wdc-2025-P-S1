const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch users: ' + error.message });
  }
});

// POST setup test data with better error handling
router.post('/setup-test-data', async (req, res) => {
  try {
    console.log('Setting up test data...');

    // Clear existing test data in correct order (foreign key constraints)
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('DELETE FROM WalkRatings');
    await db.query('DELETE FROM WalkApplications');
    await db.query('DELETE FROM WalkRequests');
    await db.query('DELETE FROM Dogs');
    await db.query('DELETE FROM Users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Cleared existing data');

    // Insert test users
    await db.query(`
      INSERT INTO Users (username, email, password_hash, role) VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner'),
      ('tom123', 'tom@example.com', 'hashed321', 'walker'),
      ('rachel123', 'rachel@example.com', 'hashed654', 'owner')
    `);

    console.log('Inserted test users');

    // Insert test dogs
    await db.query(`
      INSERT INTO Dogs (name, size, owner_id) VALUES
      ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
      ('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
      ('Ben', 'large', (SELECT user_id FROM Users WHERE username = 'rachel123')),
      ('Harry', 'small', (SELECT user_id FROM Users WHERE username = 'alice123')),
      ('Simon', 'medium', (SELECT user_id FROM Users WHERE username = 'rachel123'))
    `);

    console.log('Inserted test dogs');

    res.json({ message: 'Test data created successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Failed to setup test data: ' + error.message });
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
    res.status(500).json({ error: 'Registration failed: ' + error.message });
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

  console.log('Login attempt:', { username, password });

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, email, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    console.log('Login query result:', rows);

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

    console.log('Login successful for:', user.username);

    res.json({
      message: 'Login successful',
      user: user,
      redirect: user.role === 'owner' ? '/owner-dashboard.html' : '/walker-dashboard.html'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
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