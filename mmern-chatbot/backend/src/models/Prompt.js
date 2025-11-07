const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  text: { type: String, required: true },
  tags: [String],
  isSystem: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Prompt', PromptSchema);
