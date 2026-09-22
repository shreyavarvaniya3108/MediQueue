const { recalculateQueue } = require("../utils/calculateWaitTime");

/**
 * All Socket.io real-time logic lives here.
 * Call initSocket(io) once from server.js after creating the io instance.
 */
function initSocket(io) {
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        // Join room (userId or doctorId)
        socket.on("join", (roomId) => {
            if (roomId) {
                const roomStr = roomId.toString();
                socket.join(roomStr);
                console.log(`Socket ${socket.id} joined room: ${roomStr}`);
            }
        });

        // Doctor completes a consultation -> recalculate wait times for everyone else
        socket.on("appointment-completed", async ({ doctorId }) => {
            try {
                if (!doctorId) return;
                const updatedQueue = await recalculateQueue(doctorId);

                // Broadcast the new wait time to each waiting patient individually
                updatedQueue.forEach((appt) => {
                    const patientId = appt.patient?._id ? appt.patient._id.toString() : appt.patient?.toString();
                    if (patientId) {
                        io.to(patientId).emit("waiting-time-updated", {
                            appointmentId: appt._id,
                            estimatedWaitTime: appt.estimatedWaitTime,
                            queuePosition: appt.queuePosition,
                        });
                        io.to(patientId).emit("appointment-status-updated", {
                            appointmentId: appt._id,
                            status: appt.status,
                            estimatedWaitTime: appt.estimatedWaitTime,
                            queuePosition: appt.queuePosition,
                        });
                    }
                });

                // Also let the doctor dashboard refresh its queue view
                io.to(doctorId.toString()).emit("queue-updated");
                io.emit("queue-updated"); // Global notify fallback
            } catch (error) {
                console.log("Socket error (appointment-completed):", error.message);
            }
        });

        // Doctor flags themselves as running late -> notify all waiting patients
        socket.on("doctor-running-late", async ({ doctorId, extraMinutes }) => {
            try {
                if (!doctorId) return;
                const updatedQueue = await recalculateQueue(doctorId);

                updatedQueue.forEach((appt) => {
                    const patientId = appt.patient?._id ? appt.patient._id.toString() : appt.patient?.toString();
                    if (patientId) {
                        io.to(patientId).emit("delay-notification", {
                            message: `Your doctor is running late. Your wait time has increased by ${extraMinutes} minutes.`,
                            estimatedWaitTime: appt.estimatedWaitTime,
                        });
                        io.to(patientId).emit("waiting-time-updated", {
                            appointmentId: appt._id,
                            estimatedWaitTime: appt.estimatedWaitTime,
                            queuePosition: appt.queuePosition,
                        });
                    }
                });

                io.to(doctorId.toString()).emit("queue-updated");
            } catch (error) {
                console.log("Socket error (doctor-running-late):", error.message);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
}

module.exports = initSocket;
