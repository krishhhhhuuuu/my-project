const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./logger');
const wsServer = require('./ws-server');
const ingestRoutes = require('./routes/ingest');

(async () => {
  await mongoose.connect(config.mongoUrl);
  logger.info('Connected to MongoDB');

  const app = express();
  app.use(express.json());
  app.use('/ingest', ingestRoutes);
  app.get('/health', (req, res) => res.json({ ok: true }));

  const server = http.createServer(app);
  wsServer.attach(server);

  server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
  });
})();
