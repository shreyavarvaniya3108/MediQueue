const mongoose = require("mongoose");

const doctorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialization: { type: String, required: true },
    clinicName: { type: String, required: true },
    clinicTiming: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
    },
    avgConsultationTime: { type: Number, default: 10 }, // minutes, recalculated nightly
    patientsSeenToday: { type: Number, default: 0 },
    isRunningLate: { type: Boolean, default: false },
    lateExtraMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema);
