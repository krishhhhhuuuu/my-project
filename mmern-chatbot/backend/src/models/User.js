const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  name: String,
  role: { type: String, default: 'user' },
  credits: { type: Number, default: 1000 } // budget tokens/credits
}, { timestamps: true});
module.exports = mongoose.model('User', UserSchema);
