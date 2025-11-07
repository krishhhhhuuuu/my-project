const mongoose = require('mongoose');

const LoginEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now, index: true }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model('LoginEvent', LoginEventSchema);

