// POST login with session management and role-based redirection
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Changed from email to username

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, email, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // Store user in session
    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    };

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

// POST logout - Added logout functionality
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// GET current user session
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});