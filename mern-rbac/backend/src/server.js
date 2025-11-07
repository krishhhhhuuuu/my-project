require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');
const auditRoutes = require('./routes/audit');
const logger = require('./utils/logger');

const app = express();
app.use(express.json());
app.use(cookieParser());

const cors = require('cors');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/audit', auditRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { err: err?.stack || err });
  res.status(500).json({ error: 'internal' });
});

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => logger.info(`Server listening ${PORT}`));
}).catch(err => {
  logger.error('Mongo connection error', { err: err.message });
  process.exit(1);
});
