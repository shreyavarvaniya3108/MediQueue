import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { formatDate } from "../utils/helpers";
import { ArrowLeft, FileText, Calendar, Star, CheckCircle2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientHistory() {
    const { patientId } = useParams();
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchHistory() {
        try {
            const res = await axiosInstance.get(`/appointments/patient-history/${patientId}`);
            setHistory(res.data);
        } catch (err) {
            console.log("Could not load history", err);
        }
    }

    return (
        <div className="max-w-3xl mx-auto my-6 sm:my-8 px-3 sm:px-4 space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Doctor Console
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">
                            Patient Medical History
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Records of all past completed consultations
                        </p>
                    </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
                    {history.length} Past Visits
                </span>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {history.map((visit) => (
                        <motion.div
                            key={visit._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card p-5 border-l-4 border-l-emerald-500 space-y-2"
                        >
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    {formatDate(visit.completedAt)}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                            </div>

                            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <strong className="text-slate-900">Reason for Visit:</strong>{" "}
                                {visit.reason || "Routine Consultation"}
                            </p>

                            {visit.rating && (
                                <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 w-fit">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    Patient Rating: {visit.rating}/5
                                    {visit.feedback && (
                                        <span className="text-slate-600 font-normal ml-2">
                                            "{visit.feedback}"
                                        </span>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {history.length === 0 && (
                    <div className="card p-10 text-center text-slate-400 border-dashed border-slate-200">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-slate-600 font-semibold text-sm">No previous visit records found.</p>
                        <p className="text-slate-400 text-xs mt-1">
                            Completed consultations for this patient will be automatically logged here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
