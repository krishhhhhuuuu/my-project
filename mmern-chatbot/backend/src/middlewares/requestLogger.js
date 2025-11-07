const { v4: uuidv4 } = require('uuid');

function requestLogger(req, res, next) {
  req.requestId = uuidv4();
  console.log(`[${req.requestId}] ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    console.log(`[${req.requestId}] ${res.statusCode} - Completed`);
  });
  next();
}

module.exports = { requestLogger };