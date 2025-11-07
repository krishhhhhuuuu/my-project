const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = process.env.RATE_LIMIT_REQUESTS_PER_MIN || 30;

module.exports = (req, res, next) => {
  // ✅ Support both authenticated and query-based token routes
  const userId =
    req.user?.id ||
    req.query.userId ||
    'guest:' + (req.ip || req.headers['x-forwarded-for'] || 'unknown');

  const now = Date.now();
  const record = rateLimitMap.get(userId) || { count: 0, start: now };

  if (now - record.start < WINDOW_MS) {
    if (record.count >= MAX_REQUESTS) {
      return res
        .status(429)
        .json({ error: 'Too many requests. Please slow down.' });
    }
    record.count++;
  } else {
    // Reset window
    record.count = 1;
    record.start = now;
  }

  rateLimitMap.set(userId, record);
  next();
};
