const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { can } = require('../middleware/rbac');
const { requireAuth } = require('../middleware/auth');
const { roles } = require('../config/roles');

const router = express.Router();

/**
 * 🔹 GET /api/users
 * List all users (Admin only)
 */
router.get('/', requireAuth, can('users:manage'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * 🔹 POST /api/users
 * Create a new user (Admin only)
 */
router.post(
  '/',
  requireAuth,
  can('users:manage'),
  [
    body('name').isString().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isString().custom((v) => !!roles[v])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;

    try {
      const existing = await User.findOne({ email });
      if (existing)
        return res.status(400).json({ error: 'User with this email already exists' });

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = await User.create({
        name,
        email,
        passwordHash,
        role
      });

      res.status(201).json({
        message: '✅ User created successfully',
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

/**
 * 🔹 PATCH /api/users/:userId/role
 * Update a user’s role (Admin only)
 */
router.patch(
  '/:userId/role',
  requireAuth,
  can('users:manage'),
  [body('role').isString().custom((v) => !!roles[v])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { $set: { role: req.body.role } },
        { new: true }
      )
        .select('-passwordHash')
        .lean();

      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({ message: '✅ Role updated', user });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
);

/**
 * 🔹 DELETE /api/users/:userId
 * Delete user (Admin only)
 */
router.delete('/:userId', requireAuth, can('users:manage'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: '🗑️ User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
