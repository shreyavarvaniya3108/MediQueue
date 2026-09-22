const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true }, // optional
    password: { type: String, required: true },
    role: { type: String, enum: ["patient", "doctor"], required: true },
    age: { type: Number },
    // One-time opt-in key from CallMeBot, needed to send this user free WhatsApp messages.
    // See backend/utils/sendWhatsApp.js for how a user gets this key.
    whatsappApiKey: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);