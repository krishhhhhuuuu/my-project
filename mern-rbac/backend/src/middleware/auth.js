const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || req.cookies?.accessToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role };
    req.correlationId = payload.cid || uuidv4();
    logger.info('auth: token verified', { correlationId: req.correlationId, user: req.user.id });
    next();
  } catch (err) {
    logger.warn('auth: invalid token', { err: err.message });
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { requireAuth };
