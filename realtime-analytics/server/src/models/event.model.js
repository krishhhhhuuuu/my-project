const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventId: { type: String, unique: true, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: String,
  sessionId: String,
  route: String,
  action: String,
  metadata: Object,
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
