const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { signup, login, getMe } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", verifyToken, getMe);

module.exports = router;
