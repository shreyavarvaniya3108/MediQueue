require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const initSocket = require("./socket/socketHandler");
const { startCronJobs } = require("./utils/cronJobs");

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "*" },
});

// Middleware
app.use(cors());
app.use(express.json());

// Make the Socket.io instance available inside controllers via req.app.get("io")
app.set("io", io);

// Connect to database
connectDB();

// Routes
app.get("/", (req, res) => res.send("MediQueue API is running"));
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

// Real-time events
initSocket(io);

// Scheduled background jobs (nightly average recalculation)
startCronJobs();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));