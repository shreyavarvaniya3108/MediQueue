const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");

// POST /api/auth/signup
async function signup(req, res) {
    try {
        let { name, phone, email, whatsappApiKey, password, role, age, specialization, clinicName } = req.body;

        if (!name || !phone || !password || !role) {
            return res.status(400).json({ message: "Name, phone number, password and role are required." });
        }

        name = name.trim();
        phone = phone.trim();

        if (!name || !phone || !["patient", "doctor"].includes(role)) {
            return res.status(400).json({ message: "Please provide a valid name, phone number and role." });
        }

        if (!/^\d{4}$/.test(password)) {
            return res.status(400).json({ message: "Password must be exactly 4 digits." });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this phone number already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            phone,
            email: email || undefined, // keep optional field truly empty, not ""
            whatsappApiKey: whatsappApiKey || undefined,
            password: hashedPassword,
            role,
            age,
        });

        // If signing up as a doctor, also create their profile
        if (role === "doctor") {
            await DoctorProfile.create({
                user: user._id,
                specialization: specialization || "General Physician",
                clinicName: clinicName || "MediQueue Clinic",
            });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "An account with these details already exists." });
        }
        res.status(500).json({ message: "Signup failed.", error: error.message });
    }
}

// POST /api/auth/login
async function login(req, res) {
    try {
        let { username, phone, password } = req.body;

        if (!username || !phone || !password) {
            return res.status(400).json({ message: "Username, phone number, and password are required." });
        }

        username = username.trim();
        phone = phone.trim();

        if (!username || !phone || !/^\d{4}$/.test(password)) {
            return res.status(400).json({ message: "Name, phone number, and a 4-digit PIN are required." });
        }

        const user = await User.findOne({
            phone: phone,
            name: { $regex: new RegExp(`^${username}$`, "i") }
        });
        
        if (!user) {
            console.error(`Login failed: User not found for phone ${phone} and username ${username}`);
            return res.status(401).json({ message: "Invalid credentials (User not found)." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error(`Login failed: Password mismatch for user ${user._id}`);
            return res.status(401).json({ message: "Invalid credentials (Incorrect PIN)." });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({
            token,
            user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role },
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed.", error: error.message });
    }
}

// GET /api/auth/me  — returns the currently authenticated user
async function getMe(req, res) {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json({ id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: "Could not fetch user.", error: error.message });
    }
}

module.exports = { signup, login, getMe };