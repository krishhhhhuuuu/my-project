const express = require('express');
const mongoose = require('mongoose');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Use student routes
app.use('/students', studentRoutes);

// MongoDB connection (local MongoDB)
mongoose.connect('mongodb://localhost:27017/studentDB')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log(err));

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
