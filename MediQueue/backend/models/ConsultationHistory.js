const mongoose = require("mongoose");

const consultationHistorySchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    timeTaken: { type: Number, required: true }, // minutes
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConsultationHistory", consultationHistorySchema);
