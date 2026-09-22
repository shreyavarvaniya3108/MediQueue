const Appointment = require("../models/Appointment");
const ConsultationHistory = require("../models/ConsultationHistory");
const DoctorProfile = require("../models/DoctorProfile");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { recalculateQueue } = require("../utils/calculateWaitTime");
const { sendSMS } = require("../utils/sendSMS");

// POST /api/appointments/book  (patient sends a request)
async function bookAppointment(req, res) {
    try {
        const { doctorId, reason } = req.body;

        if (!doctorId) {
            return res.status(400).json({ message: "Doctor is required." });
        }

        const doctor = await DoctorProfile.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }

        const appointment = await Appointment.create({
            patient: req.user.userId,
            doctor: doctorId,
            reason: typeof reason === "string" ? reason.trim() : "",
            status: "pending",
        });

        const updatedQueue = await recalculateQueue(doctorId);

        const populatedAppointment = await Appointment.findById(appointment._id).populate(
            "patient",
            "name phone age email"
        );

        // Notify the doctor's dashboard live, so they see the new request instantly
        const io = req.app.get("io");
        if (io) {
            io.to(doctorId.toString()).emit("new-appointment-request", populatedAppointment);
            io.to(doctorId.toString()).emit("queue-updated");

            const doctorProfile = await DoctorProfile.findById(doctorId);
            if (doctorProfile && doctorProfile.user) {
                io.to(doctorProfile.user.toString()).emit("new-appointment-request", populatedAppointment);
                io.to(doctorProfile.user.toString()).emit("queue-updated");
            }

            // Global socket broadcast to guarantee UI sync across all active views
            io.emit("queue-updated");

            updatedQueue.forEach((appt) => {
                const pId = appt.patient?._id ? appt.patient._id.toString() : appt.patient?.toString();
                if (pId) {
                    io.to(pId).emit("waiting-time-updated", {
                        appointmentId: appt._id,
                        estimatedWaitTime: appt.estimatedWaitTime,
                        queuePosition: appt.queuePosition,
                    });
                }
            });
        }

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: "Booking failed.", error: error.message });
    }
}

// GET /api/appointments/my  (patient's own appointments)
async function getMyAppointments(req, res) {
    try {
        const appointments = await Appointment.find({ patient: req.user.userId })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .sort({ createdAt: -1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch appointments.", error: error.message });
    }
}

// GET /api/appointments/queue  (doctor's today queue - pending + accepted + delayed)
async function getDoctorQueue(req, res) {
    try {
        const doctorProfile = await DoctorProfile.findOne({ user: req.user.userId });
        if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found." });

        const appointments = await Appointment.find({
            doctor: doctorProfile._id,
            status: { $in: ["pending", "accepted", "delayed"] },
        })
            .populate("patient", "name email phone age")
            .sort({ startedAt: 1, bookedAt: 1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch queue.", error: error.message });
    }
}

// PUT /api/appointments/:id/respond   body: { action: "accept" | "reject" | "delay", delayReason }
async function respondToAppointment(req, res) {
    try {
        const { action, delayReason } = req.body;
        const doctorProfile = await DoctorProfile.findOne({ user: req.user.userId });
        if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found." });

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            doctor: doctorProfile._id,
        });

        if (!appointment) return res.status(404).json({ message: "Appointment not found." });

        if (!["pending", "accepted", "delayed"].includes(appointment.status)) {
            return res.status(400).json({ message: "This appointment can no longer be updated." });
        }

        if (action === "accept") {
            appointment.status = "accepted";
            appointment.startedAt = new Date(); // marks when the patient entered the active queue
        } else if (action === "reject") {
            appointment.status = "rejected";
        } else if (action === "delay") {
            appointment.status = "delayed";
            appointment.delayReason = delayReason || "Doctor requested a delay.";
        } else {
            return res.status(400).json({ message: "Invalid action." });
        }

        await appointment.save();

        const patientUser = await User.findById(appointment.patient);

        // Notify the patient about the decision (in-app + SMS)
        const statusMessage =
            action === "accept"
                ? "Your appointment request was accepted."
                : action === "reject"
                    ? "Your appointment request was rejected."
                    : `Your appointment was delayed: ${appointment.delayReason}`;

        await Notification.create({
            recipient: appointment.patient,
            type: "status-update",
            message: statusMessage,
        });

        if (patientUser?.phone) {
            sendSMS(patientUser.phone, `MediQueue: ${statusMessage}`);
        }

        // If accepted or updated, recalculate the queue so wait times stay accurate
        const updatedQueue = await recalculateQueue(appointment.doctor);

        // Re-fetch populated appointment with position & estimated wait time
        const updatedAppt = await Appointment.findById(appointment._id)
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .populate("patient", "name email phone age");

        const io = req.app.get("io");
        if (io) {
            const pIdStr = appointment.patient.toString();
            const dIdStr = appointment.doctor.toString();

            io.to(pIdStr).emit("appointment-status-updated", updatedAppt);
            io.to(dIdStr).emit("queue-updated");
            io.to(req.user.userId.toString()).emit("queue-updated");
            
            // Note: DO NOT emit appointment-status-updated globally, otherwise EVERY patient gets a success toast!
            io.emit("queue-updated"); // This is fine to trigger queue recalculations

            updatedQueue.forEach((appt) => {
                const pId = appt.patient?._id ? appt.patient._id.toString() : appt.patient?.toString();
                if (pId) {
                    io.to(pId).emit("waiting-time-updated", {
                        appointmentId: appt._id,
                        estimatedWaitTime: appt.estimatedWaitTime,
                        queuePosition: appt.queuePosition,
                    });
                }
            });
        }

        return res.json(updatedAppt);
    } catch (error) {
        res.status(500).json({ message: "Could not update appointment.", error: error.message });
    }
}

// PUT /api/appointments/:id/complete  (doctor marks consultation as done)
async function completeAppointment(req, res) {
    try {
        const doctorProfile = await DoctorProfile.findOne({ user: req.user.userId });
        if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found." });

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            doctor: doctorProfile._id,
        });
        if (!appointment) return res.status(404).json({ message: "Appointment not found." });
        if (!["accepted", "delayed"].includes(appointment.status)) {
            return res.status(400).json({ message: "Only an active appointment can be completed." });
        }

        const startTime = appointment.startedAt || Date.now();
        let timeTaken = Math.round((Date.now() - new Date(startTime)) / 60000);
        timeTaken = Math.min(Math.max(1, timeTaken), 45); // Clamp consultation duration to 1-45 min max

        appointment.status = "completed";
        appointment.completedAt = new Date();
        await appointment.save();

        // Save to consultation history (used for nightly average recalculation)
        await ConsultationHistory.create({
            doctor: appointment.doctor,
            patient: appointment.patient,
            appointment: appointment._id,
            timeTaken,
        });

        // Increase today's patient count
        const doctor = doctorProfile;
        if (doctor) {
            doctor.patientsSeenToday = (doctor.patientsSeenToday || 0) + 1;
            // Sanitize delay minutes to avoid 1000+ min inflation from old records
            if (doctor.lateExtraMinutes > 120) {
                doctor.lateExtraMinutes = 15;
            }
            await doctor.save();
        }

        // Recalculate wait times for everyone still waiting
        const updatedQueue = await recalculateQueue(appointment.doctor);

        // Real-time socket emissions
        const io = req.app.get("io");
        if (io) {
            const patientId = appointment.patient.toString();
            const doctorId = appointment.doctor.toString();

            io.to(patientId).emit("appointment-status-updated", appointment);
            io.to(doctorId).emit("queue-updated");
            io.to(req.user.userId.toString()).emit("queue-updated");
            io.emit("queue-updated");

            updatedQueue.forEach((appt) => {
                const pId = appt.patient?._id ? appt.patient._id.toString() : appt.patient?.toString();
                if (pId) {
                    io.to(pId).emit("waiting-time-updated", {
                        appointmentId: appt._id,
                        estimatedWaitTime: appt.estimatedWaitTime,
                        queuePosition: appt.queuePosition,
                    });
                }
            });
        }

        res.json({ completedAppointment: appointment, updatedQueue });
    } catch (error) {
        res.status(500).json({ message: "Could not complete appointment.", error: error.message });
    }
}

// GET /api/appointments/patient-history/:patientId  (doctor views a patient's past visits)
async function getPatientHistory(req, res) {
    try {
        const doctorProfile = await DoctorProfile.findOne({ user: req.user.userId });
        if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found." });

        const history = await Appointment.find({
            patient: req.params.patientId,
            doctor: doctorProfile._id,
            status: "completed",
        }).sort({ completedAt: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Could not fetch patient history.", error: error.message });
    }
}

// PUT /api/appointments/:id/rate  (patient rates the doctor after a visit)
async function rateAppointment(req, res) {
    try {
        const { rating, feedback } = req.body;

        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
        }

        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, patient: req.user.userId, status: "completed" },
            { rating: numericRating, feedback: typeof feedback === "string" ? feedback.trim() : "" },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: "Completed appointment not found." });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: "Could not save rating.", error: error.message });
    }
}

module.exports = {
    bookAppointment,
    getMyAppointments,
    getDoctorQueue,
    respondToAppointment,
    completeAppointment,
    getPatientHistory,
    rateAppointment,
};