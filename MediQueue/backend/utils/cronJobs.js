const cron = require("node-cron");
const DoctorProfile = require("../models/DoctorProfile");
const ConsultationHistory = require("../models/ConsultationHistory");

/**
 * Every night at midnight, recalculate each doctor's average
 * consultation time using their most recent 30 completed visits.
 */
function startCronJobs() {
    cron.schedule("0 0 * * *", async () => {
        console.log("Running nightly job: recalculating doctor average consultation times...");

        try {
            const doctors = await DoctorProfile.find();

            for (const doctor of doctors) {
                const result = await ConsultationHistory.aggregate([
                    { $match: { doctor: doctor._id } },
                    { $sort: { date: -1 } },
                    { $limit: 30 },
                    { $group: { _id: null, avgTime: { $avg: "$timeTaken" } } },
                ]);

                if (result.length > 0) {
                    doctor.avgConsultationTime = Math.round(result[0].avgTime);
                    doctor.patientsSeenToday = 0; // reset daily counter
                    await doctor.save();
                }
            }

            console.log("Doctor average consultation times updated.");
        } catch (error) {
            console.log("Cron job failed:", error.message);
        }
    });
}

module.exports = { startCronJobs };
