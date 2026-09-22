const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");
const { getDoctorAnalytics } = require("../controllers/analyticsController");

router.get("/summary", verifyToken, checkRole("doctor"), getDoctorAnalytics);

module.exports = router;
