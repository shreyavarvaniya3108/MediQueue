import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { Stethoscope, Send, AlertCircle, Calendar, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function BookAppointment() {
    const { doctorId } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (doctorId) {
            axiosInstance.get(`/doctors/${doctorId}`)
                .then((res) => setDoctor(res.data))
                .catch((err) => console.log(err));
        }
    }, [doctorId]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await axiosInstance.post("/appointments/book", { doctorId, reason });
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Could not book appointment.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-lg mx-auto my-6 sm:my-12 px-3 sm:px-4">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Doctors
            </button>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5 sm:p-8 space-y-6 shadow-xl relative overflow-hidden"
            >
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-100 dark:border-emerald-800/60">
                        <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white">
                            Request Appointment
                        </h1>
                        {doctor && doctor.user && (
                            <p className="text-xs font-semibold text-primary dark:text-sky-400 mt-0.5">
                                Dr. {doctor.user.name} ({doctor.specialization})
                            </p>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" /> Reason for Visit (Optional)
                        </label>
                        <textarea
                            placeholder="Describe your symptom, consultation request, or routine checkup details..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="w-full border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
                    >
                        {loading ? (
                            "Sending request..."
                        ) : (
                            <>
                                <Send className="w-4 h-4" /> Send Request to Doctor
                            </>
                        )}
                    </button>

                    <p className="text-[11px] text-slate-400 text-center font-medium">
                        Your request will be sent to the doctor's queue instantly via live sync.
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
