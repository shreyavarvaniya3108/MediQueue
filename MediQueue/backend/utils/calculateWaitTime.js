const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");
const { sendWhatsApp } = require("./sendWhatsApp");
const { makeVoiceCall } = require("./makeVoiceCall");

/**
 * Recalculates queue position and estimated wait time for every
 * "accepted" appointment of a given doctor, in the order they were accepted.
 * - Position 2: sends a free WhatsApp heads-up.
 * - Position 1 (their turn is next): places an AI voice call reminder.
 * Returns the updated list of appointments (with patient populated).
 */
async function recalculateQueue(doctorId) {
    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");

    const avgTime = doctor.avgConsultationTime || 10;
    const extraDelay = doctor.isRunningLate ? doctor.lateExtraMinutes || 0 : 0;

    // All patients currently waiting for this doctor, oldest request first
    const waitingAppointments = await Appointment.find({
        doctor: doctorId,
        status: { $in: ["pending", "accepted", "delayed"] },
    })
        .sort({ startedAt: 1, bookedAt: 1 })
        .populate("patient", "name phone whatsappApiKey");

    const updates = [];

    for (let i = 0; i < waitingAppointments.length; i++) {
        const appt = waitingAppointments[i];
        const patientsAhead = i; // 0 patients ahead for the first person in queue
        const estimatedWaitTime = patientsAhead * avgTime + extraDelay;
        const newPosition = i + 1;

        const justBecameNext = newPosition <= 2 && appt.queuePosition !== newPosition;

        if (justBecameNext && newPosition === 1 && appt.patient?.phone) {
            // Their turn is next — an AI voice call feels more urgent than a text
            makeVoiceCall(
                appt.patient.phone,
                `Hello ${appt.patient.name || "there"}. This is an automated reminder from MediQueue. ` +
                `It is almost your turn to see the doctor. Please head to the clinic now.`
            );
        } else if (justBecameNext && newPosition === 2 && appt.patient?.phone && appt.patient?.whatsappApiKey) {
            sendWhatsApp(
                appt.patient.phone,
                appt.patient.whatsappApiKey,
                `MediQueue: Your turn is coming up soon — about ${estimatedWaitTime} min to go.`
            );
        }

        appt.queuePosition = newPosition;
        appt.estimatedWaitTime = estimatedWaitTime;
        await appt.save();

        updates.push(appt);
    }

    return updates;
}

module.exports = { recalculateQueue };