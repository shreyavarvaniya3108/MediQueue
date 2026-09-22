const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { getMyNotifications, markAsRead } = require("../controllers/notificationController");

router.get("/my", verifyToken, getMyNotifications);
router.put("/:id/read", verifyToken, markAsRead);

module.exports = router;
