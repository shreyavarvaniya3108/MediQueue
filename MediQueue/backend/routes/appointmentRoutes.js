const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const {
    bookAppointment,
    getMyAppointments,
    getDoctorQueue,
    respondToAppointment,
    completeAppointment,
    getPatientHistory,
    rateAppointment,
} = require("../controllers/appointmentController");

// Patient & Booking routes (any authenticated user can book and view their own appointments)
router.post("/book", verifyToken, bookAppointment);
router.get("/my", verifyToken, getMyAppointments);
router.put("/:id/rate", verifyToken, rateAppointment);

// Doctor routes
router.get("/queue", verifyToken, checkRole("doctor"), getDoctorQueue);
router.put("/:id/respond", verifyToken, checkRole("doctor"), respondToAppointment);
router.put("/:id/complete", verifyToken, checkRole("doctor"), completeAppointment);
router.get("/patient-history/:patientId", verifyToken, checkRole("doctor"), getPatientHistory);

module.exports = router;
