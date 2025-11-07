const mongoose = require('mongoose');

const aggregateSchema = new mongoose.Schema({
  room: String,
  resolution: Number,
  timestamp: Date,
  count: Number,
  uniques: Number,
  topRoutes: Array,
  errors: Number,
}, { timestamps: true });

module.exports = mongoose.model('Aggregate', aggregateSchema);
