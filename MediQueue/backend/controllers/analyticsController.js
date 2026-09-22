const DoctorProfile = require("../models/DoctorProfile");
const ConsultationHistory = require("../models/ConsultationHistory");
const Appointment = require("../models/Appointment");

// GET /api/analytics/summary  (doctor's own analytics)
async function getDoctorAnalytics(req, res) {
    try {
        const doctorProfile = await DoctorProfile.findOne({ user: req.user.userId });
        if (!doctorProfile) return res.status(404).json({ message: "Doctor profile not found." });

        const doctorId = doctorProfile._id;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const sevenDaysAgo = new Date(startOfToday);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // includes today = 7 days total

        // 1) Patients seen today / this week
        const [todayCount, weekCount, totalCount] = await Promise.all([
            ConsultationHistory.countDocuments({ doctor: doctorId, date: { $gte: startOfToday } }),
            ConsultationHistory.countDocuments({ doctor: doctorId, date: { $gte: sevenDaysAgo } }),
            ConsultationHistory.countDocuments({ doctor: doctorId }),
        ]);

        // 2) Daily trend for the last 7 days: patients seen + avg consultation time per day
        const dailyTrendRaw = await ConsultationHistory.aggregate([
            { $match: { doctor: doctorId, date: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    patientsSeen: { $sum: 1 },
                    avgTime: { $avg: "$timeTaken" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill in missing days with 0 so the chart always shows 7 continuous days
        const dailyTrend = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            const found = dailyTrendRaw.find((row) => row._id === key);
            dailyTrend.push({
                date: key,
                patientsSeen: found ? found.patientsSeen : 0,
                avgTime: found ? Math.round(found.avgTime) : 0,
            });
        }

        // 3) Peak hours — which hour of the day is busiest (all-time)
        const peakHoursRaw = await ConsultationHistory.aggregate([
            { $match: { doctor: doctorId } },
            { $group: { _id: { $hour: "$date" }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);
        const peakHours = peakHoursRaw.map((row) => ({ hour: row._id, count: row.count }));

        // 4) Current pending / rejected / completed counts overall (for a quick status breakdown)
        const statusBreakdown = await Appointment.aggregate([
            { $match: { doctor: doctorId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        res.json({
            todayCount,
            weekCount,
            totalCount,
            avgConsultationTime: doctorProfile.avgConsultationTime,
            dailyTrend,
            peakHours,
            statusBreakdown,
        });
    } catch (error) {
        res.status(500).json({ message: "Could not load analytics.", error: error.message });
    }
}

module.exports = { getDoctorAnalytics };
