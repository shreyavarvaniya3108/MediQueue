const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "delayed", "completed"],
      default: "pending",
    },
    bookedAt: { type: Date, default: Date.now },
    estimatedWaitTime: { type: Number, default: 0 }, // minutes
    queuePosition: { type: Number, default: 0 },
    delayReason: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
