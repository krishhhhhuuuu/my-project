const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');
const { mongoUri } = require('./config');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const { requestLogger } = require('./middlewares/requestLogger');

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '200kb' }));
app.use(morgan('tiny'));
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// connect
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('mongodb connected'))
  .catch(err => {
    console.error('mongo connect failed', err);
    process.exit(1);
  });

module.exports = app;
