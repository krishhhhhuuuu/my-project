require('dotenv').config();
module.exports = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  openaiKey: process.env.OPENAI_API_KEY,
  dialogflowProjectId: process.env.DIALOGFLOW_PROJECT_ID,
  maxTokensPerSession: parseInt(process.env.MAX_TOKENS_PER_SESSION || '80000', 10),
  rateLimitRequestsPerMin: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MIN || '30', 10)
};
