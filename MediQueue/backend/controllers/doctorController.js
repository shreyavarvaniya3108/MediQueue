const DoctorProfile = require("../models/DoctorProfile");
const Appointment = require("../models/Appointment");

// GET /api/doctors  (used by patient to see clinic doctors)
async function getAllDoctors(req, res) {
    try {
        const doctors = await DoctorProfile.find().populate("user", "name email phone");
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch doctors.", error: error.message });
    }
}

// GET /api/doctors/:id
async function getDoctorById(req, res) {
    try {
        const doctor = await DoctorProfile.findById(req.params.id).populate("user", "name email phone");
        if (!doctor) return res.status(404).json({ message: "Doctor not found." });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch doctor.", error: error.message });
    }
}

// PUT /api/doctors/setup  (doctor updates their own profile)
async function updateDoctorProfile(req, res) {
    try {
        const { specialization, clinicName, clinicTiming } = req.body;

        const cleanSpecialization = typeof specialization === "string" ? specialization.trim() : "";
        const cleanClinicName = typeof clinicName === "string" ? clinicName.trim() : "";
        const start = clinicTiming?.start;
        const end = clinicTiming?.end;

        if (!cleanSpecialization || !cleanClinicName || !/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end) || start >= end) {
            return res.status(400).json({ message: "Please provide valid clinic details and operating hours." });
        }

        const doctor = await DoctorProfile.findOneAndUpdate(
            { user: req.user.userId },
            { specialization: cleanSpecialization, clinicName: cleanClinicName, clinicTiming: { start, end } },
            { new: true }
        );

        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: "Could not update profile.", error: error.message });
    }
}

// GET /api/doctors/me/profile  (doctor fetches their own profile)
async function getMyDoctorProfile(req, res) {
    try {
        const doctor = await DoctorProfile.findOne({ user: req.user.userId }).populate(
            "user",
            "name email phone"
        );
        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch profile.", error: error.message });
    }
}

const { recalculateQueue } = require("../utils/calculateWaitTime");

// PUT /api/doctors/running-late  (doctor flags themselves as delayed)
async function setRunningLate(req, res) {
    try {
        const { isRunningLate, lateExtraMinutes } = req.body;
        if (typeof isRunningLate !== "boolean") {
            return res.status(400).json({ message: "Running-late status must be true or false." });
        }
        const sanitizedMinutes = Math.min(Math.max(0, Number(lateExtraMinutes) || 0), 120);

        const doctor = await DoctorProfile.findOneAndUpdate(
            { user: req.user.userId },
            { isRunningLate, lateExtraMinutes: sanitizedMinutes },
            { new: true }
        );

        if (!doctor) return res.status(404).json({ message: "Doctor profile not found." });

        const updatedQueue = await recalculateQueue(doctor._id);
        const io = req.app.get("io");
        if (io) {
            updatedQueue.forEach((appt) => {
                const patientId = appt.patient?._id ? appt.patient._id.toString() : appt.patient?.toString();
                if (patientId) {
                    io.to(patientId).emit("delay-notification", {
                        message: doctor.isRunningLate
                            ? `Your doctor is running late (+${doctor.lateExtraMinutes} min). Your wait time has been updated.`
                            : `Your doctor is back on schedule!`,
                        estimatedWaitTime: appt.estimatedWaitTime,
                    });
                    io.to(patientId).emit("waiting-time-updated", {
                        appointmentId: appt._id,
                        estimatedWaitTime: appt.estimatedWaitTime,
                        queuePosition: appt.queuePosition,
                    });
                }
            });
            io.to(doctor._id.toString()).emit("queue-updated");
            io.to(req.user.userId.toString()).emit("queue-updated");
        }

        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: "Could not update status.", error: error.message });
    }
}

module.exports = {
    getAllDoctors,
    getDoctorById,
    updateDoctorProfile,
    getMyDoctorProfile,
    setRunningLate,
};
