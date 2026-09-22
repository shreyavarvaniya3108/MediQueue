const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
  loginAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LoginLog', loginLogSchema);
