module.exports = {
  port: process.env.PORT || 4000,
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/realtime',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  wsMaxPayload: 64 * 1024, // 64 KB
  rateLimitPerMin: 600,
};
