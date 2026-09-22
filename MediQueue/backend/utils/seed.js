const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");

async function seedTestUsers() {
    try {
        const count = await User.countDocuments();
        if (count > 0) return; // Only seed if empty

        console.log("[DB Seed] Database is empty. Creating test users with fixed IDs...");

        const hashedPassword = await bcrypt.hash("1234", 10);
        const fixedPatientId = new mongoose.Types.ObjectId("650c1f1e1c9d440000a1b1c1");
        const fixedDoctorId = new mongoose.Types.ObjectId("650c1f1e1c9d440000a1b1c2");
        const fixedProfileId = new mongoose.Types.ObjectId("650c1f1e1c9d440000a1b1c3");

        // Create Patient
        await User.create({
            _id: fixedPatientId,
            name: "Rohit Yadav",
            phone: "1234567890",
            password: hashedPassword,
            role: "patient",
            age: 25,
        });

        // Create Doctor
        const doctorUser = await User.create({
            _id: fixedDoctorId,
            name: "Rohan Verma",
            phone: "0987654321",
            password: hashedPassword,
            role: "doctor",
            age: 35,
        });

        await DoctorProfile.create({
            _id: fixedProfileId,
            user: doctorUser._id,
            specialization: "Orthopedic surgeon",
            clinicName: "City Hospital",
            patientsSeenToday: 0,
            lateExtraMinutes: 0
        });

        console.log("[DB Seed] Test users created successfully!");
        console.log("-> Patient: Name 'Rohit Yadav', Phone '1234567890', PIN '1234'");
        console.log("-> Doctor: Name 'Rohan Verma', Phone '0987654321', PIN '1234'");
    } catch (error) {
        console.error("[DB Seed] Error creating test users:", error.message);
    }
}

module.exports = seedTestUsers;
