const mongoose = require('mongoose');
const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  provider: { type: String, default: 'openai' }, // openai / dialogflow
  model: String,
  systemPrompt: String,
  lastActiveAt: { type: Date, default: Date.now },
  tokenUsage: { type: Number, default: 0 }
}, { timestamps: true });

SessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60*60*24*30 }); // TTL 30 days for sessions
module.exports = mongoose.model('Session', SessionSchema);
