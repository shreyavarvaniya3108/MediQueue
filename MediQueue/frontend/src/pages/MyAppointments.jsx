import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import AppointmentCard from "../components/AppointmentCard";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import { Calendar, Star, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [ratingFor, setRatingFor] = useState(null);
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        fetchAppointments();

        if (user?.id) {
            socket.emit("join", user.id);
        }

        const onUpdate = () => {
            fetchAppointments();
        };

        socket.on("appointment-status-updated", onUpdate);
        socket.on("waiting-time-updated", onUpdate);
        socket.on("queue-updated", onUpdate);

        return () => {
            socket.off("appointment-status-updated", onUpdate);
            socket.off("waiting-time-updated", onUpdate);
            socket.off("queue-updated", onUpdate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    async function fetchAppointments() {
        try {
            const res = await axiosInstance.get("/appointments/my");
            setAppointments(res.data);
        } catch (err) {
            console.log("Could not load appointments", err);
        }
    }

    async function submitRating(id) {
        try {
            await axiosInstance.put(`/appointments/${id}/rate`, { rating, feedback });
            setRatingFor(null);
            setFeedback("");
            fetchAppointments();
        } catch (err) {
            console.log("Could not submit rating", err);
        }
    }

    return (
        <div className="max-w-4xl mx-auto my-6 sm:my-8 px-3 sm:px-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">
                            My Consultation History
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Track all your active, upcoming, and completed visits
                        </p>
                    </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
                    {appointments.length} Total Records
                </span>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {appointments.map((appt) => (
                        <div key={appt._id} className="space-y-2">
                            <AppointmentCard
                                appointment={appt}
                                actions={
                                    appt.status === "completed" && !appt.rating ? (
                                        <button
                                            onClick={() => setRatingFor(ratingFor === appt._id ? null : appt._id)}
                                            className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center gap-1"
                                        >
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Rate Visit
                                        </button>
                                    ) : appt.rating ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            Rated {appt.rating}/5
                                        </span>
                                    ) : null
                                }
                            />

                            {ratingFor === appt._id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Rate Doctor Experience
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((starNum) => (
                                                <button
                                                    key={starNum}
                                                    type="button"
                                                    onClick={() => setRating(starNum)}
                                                    className="p-1 hover:scale-110 transition-transform"
                                                >
                                                    <Star
                                                        className={`w-5 h-5 ${
                                                            starNum <= rating
                                                                ? "text-amber-400 fill-amber-400"
                                                                : "text-slate-300"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <textarea
                                        placeholder="Share feedback on your consultation experience (optional)"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full bg-white border border-amber-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                        rows={2}
                                    />

                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setRatingFor(null)}
                                            className="px-3.5 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => submitRating(appt._id)}
                                            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-1"
                                        >
                                            <Send className="w-3.5 h-3.5" /> Submit Review
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </AnimatePresence>

                {appointments.length === 0 && (
                    <div className="card p-12 text-center text-slate-400 border-dashed border-slate-200">
                        <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-600 font-semibold text-base">No appointments booked yet.</p>
                        <p className="text-slate-400 text-xs mt-1">
                            Browse available doctors from your live dashboard to request a consultation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
