const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const {
    getAllDoctors,
    getDoctorById,
    updateDoctorProfile,
    getMyDoctorProfile,
    setRunningLate,
} = require("../controllers/doctorController");

router.get("/", verifyToken, getAllDoctors);
router.get("/me/profile", verifyToken, checkRole("doctor"), getMyDoctorProfile);
router.put("/setup", verifyToken, checkRole("doctor"), updateDoctorProfile);
router.put("/running-late", verifyToken, checkRole("doctor"), setRunningLate);
router.get("/:id", verifyToken, getDoctorById);

module.exports = router;
