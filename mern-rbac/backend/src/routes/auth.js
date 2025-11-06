const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { roles, defaultRole } = require('../config/roles');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || '15m';

// login
router.post('/login', [
  body('email').isEmail(),
  body('password').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
  res.json({ accessToken: token, user: { id: user._id, name: user.name, role: user.role } });
});

// register (open for demo; consider limiting in prod)
router.post('/register', [
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Email already registered' });

  const pwHash = await bcrypt.hash(password, 12);
  const assigned = role && roles[role] ? role : defaultRole;
  const user = new User({ name, email, passwordHash: pwHash, role: assigned });
  await user.save();
  res.status(201).json({ id: user._id, email: user.email, role: user.role });
});

// me endpoint for UI
router.get('/me', async (req, res) => {
  // token expected in Authorization header - simple helper
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
