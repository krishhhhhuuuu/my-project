const express = require('express');
const LoginEvent = require('../models/LoginEvent');
const { requireAuth } = require('../middleware/auth');
const { can } = require('../middleware/rbac');

const router = express.Router();

// GET /api/audit/login-events
router.get('/login-events', requireAuth, can('audit:read'), async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);

  try {
    const events = await LoginEvent.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(
      events.map((event) => ({
        id: event._id,
        email: event.email,
        loginTime: event.createdAt,
        ip: event.ip || 'unknown',
        userAgent: event.userAgent || ''
      }))
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to load login events' });
  }
});

module.exports = router;

