const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['user','assistant','system','tool'] },
  text: String,
  tokens: Number,
  metadata: Object,
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
