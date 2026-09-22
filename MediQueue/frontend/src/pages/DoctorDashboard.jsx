import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import socket from "../socket/socket";
import AppointmentCard from "../components/AppointmentCard";
import { SkeletonList } from "../components/Skeleton";
import { Stethoscope, Users, Clock, CheckCircle2, AlertTriangle, Check, X, FileText, BadgeCheck, Activity, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDoctorAvatar } from "../utils/doctorAvatars";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
};

export default function DoctorDashboard() {
    const [queue, setQueue] = useState([]);
    const [loadingQueue, setLoadingQueue] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [delayModalFor, setDelayModalFor] = useState(null);
    const [delayReason, setDelayReason] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const { user } = useAuth();
    const navigate = useNavigate();
    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        if (user?.id) socket.emit("join", user.id);
        if (user?._id) socket.emit("join", user._id);
        fetchProfile();
        fetchQueue();

        const onQueueUpdate = () => {
            fetchQueue();
            fetchProfile();
        };

        const onConnect = () => {
            if (user?.id) socket.emit("join", user.id);
            if (user?._id) socket.emit("join", user._id);
            if (doctorProfile?._id) socket.emit("join", doctorProfile._id);
        };

        socket.on("connect", onConnect);
        socket.on("queue-updated", onQueueUpdate);
        socket.on("new-appointment-request", onQueueUpdate);

        return () => {
            socket.off("connect", onConnect);
            socket.off("queue-updated", onQueueUpdate);
            socket.off("new-appointment-request", onQueueUpdate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, doctorProfile?._id]);

    async function fetchProfile() {
        try {
            const res = await axiosInstance.get("/doctors/me/profile");
            setDoctorProfile(res.data);
            if (res.data?._id) {
                socket.emit("join", res.data._id);
            }
        } catch (err) {
            console.log("Could not load profile", err);
        }
    }

    async function fetchQueue() {
        try {
            const res = await axiosInstance.get("/appointments/queue");
            setQueue(res.data);
        } catch (err) {
            console.log("Could not load queue", err);
        } finally {
            setLoadingQueue(false);
        }
    }

    async function respond(id, action, reason) {
        setActionLoadingId(id);
        try {
            await axiosInstance.put(`/appointments/${id}/respond`, { action, delayReason: reason });
            setDelayModalFor(null);
            setDelayReason("");
            await fetchQueue();
            await fetchProfile();
        } catch (err) {
            console.log("Could not update appointment", err);
        } finally {
            setActionLoadingId(null);
        }
    }

    async function markDone(id) {
        setActionLoadingId(id);
        try {
            await axiosInstance.put(`/appointments/${id}/complete`);
            if (doctorProfile) {
                socket.emit("appointment-completed", { doctorId: doctorProfile._id });
            }
            await fetchQueue();
            await fetchProfile();
        } catch (err) {
            console.log("Could not complete appointment", err);
        } finally {
            setActionLoadingId(null);
        }
    }

    const pending = queue.filter((a) => a.status === "pending");
    const accepted = queue.filter((a) => ["accepted", "delayed"].includes(a.status));
    const doctorAvatar = doctorProfile ? getDoctorAvatar(doctorProfile) : null;

    return (
        <div className="max-w-5xl mx-auto my-6 sm:my-8 px-3 sm:px-4 space-y-6 sm:space-y-8">
            {/* ═══════ Live Hospital Vitals Ticker ═══════ */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-900 text-white py-2.5 px-5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg border border-slate-800 overflow-hidden relative"
            >
                <div className="absolute inset-0 shimmer-badge pointer-events-none opacity-20" />

                <div className="flex items-center gap-2 relative z-10">
                    <span className="live-beacon w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">CLINIC CONSOLE</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] overflow-x-auto no-scrollbar relative z-10">
                    <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-sky-400" /> Waitlist: {pending.length + accepted.length}
                    </span>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Seen Today: {doctorProfile?.patientsSeenToday || 0}
                    </span>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Live Sync Active
                    </span>
                </div>
            </motion.div>

            {/* ═══════ Doctor Profile Banner ═══════ */}
            {doctorProfile && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="medical-gradient animate-gradient-shift rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute -right-8 -bottom-8 opacity-[0.08] pointer-events-none animate-float-up">
                        <Stethoscope className="w-72 h-72" />
                    </div>
                    <div className="absolute top-0 right-10 w-24 h-24 bg-sky-400/20 rounded-full blur-3xl animate-float-slow pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="relative shrink-0 group">
                                <img
                                    src={doctorAvatar}
                                    alt={`Dr. ${doctorProfile.user?.name}`}
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/20 shadow-xl group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-[#0f172a] shadow-lg flex items-center justify-center" title="Clinic Console Active">
                                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight flex items-center gap-2 drop-shadow-md">
                                        Dr. {doctorProfile.user?.name}
                                        <BadgeCheck className="w-6 h-6 text-sky-400 fill-sky-400/20" />
                                    </h1>
                                </div>
                                <p className="text-blue-100 text-sm sm:text-base font-semibold flex items-center gap-2.5">
                                    <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">{doctorProfile.specialization}</span>
                                    <span className="opacity-60">•</span>
                                    <span>🏥 {doctorProfile.clinicName}</span>
                                </p>
                                
                                <div className="pt-1.5">
                                    {doctorProfile.isRunningLate ? (
                                        <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-inner">
                                            <AlertTriangle className="w-4 h-4" /> Running Late (+{doctorProfile.lateExtraMinutes}m)
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-inner">
                                            <Activity className="w-4 h-4 animate-pulse" /> Clinic Open & On Schedule
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Stats Chips */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-white/10 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-white/20 shadow-inner">
                            <div className="text-center px-2">
                                <span className="text-2xl sm:text-4xl font-display font-black text-amber-300 drop-shadow-md animate-count-up">
                                    {pending.length}
                                </span>
                                <p className="text-[10px] sm:text-xs uppercase font-extrabold text-blue-200 tracking-widest mt-1">
                                    Pending
                                </p>
                            </div>
                            <div className="text-center px-2 border-x border-white/20">
                                <span className="text-2xl sm:text-4xl font-display font-black text-emerald-300 drop-shadow-md animate-count-up" style={{ animationDelay: '0.1s' }}>
                                    {accepted.length}
                                </span>
                                <p className="text-[10px] sm:text-xs uppercase font-extrabold text-blue-200 tracking-widest mt-1">
                                    In Queue
                                </p>
                            </div>
                            <div className="text-center px-2">
                                <span className="text-2xl sm:text-4xl font-display font-black text-white drop-shadow-md animate-count-up" style={{ animationDelay: '0.2s' }}>
                                    {doctorProfile.patientsSeenToday || 0}
                                </span>
                                <p className="text-[10px] sm:text-xs uppercase font-extrabold text-blue-200 tracking-widest mt-1">
                                    Seen Today
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ═══════ Filter Tabs for Queue View ═══════ */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit relative shadow-sm"
            >
                <button
                    onClick={() => setActiveTab("all")}
                    className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all z-10 ${
                        activeTab === "all" ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                >
                    {activeTab === "all" && (
                        <motion.div layoutId="activeTab" className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 -z-10" />
                    )}
                    All Queue ({queue.length})
                </button>
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 z-10 ${
                        activeTab === "pending" ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                >
                    {activeTab === "pending" && (
                        <motion.div layoutId="activeTab" className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 -z-10" />
                    )}
                    <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'pending' ? 'bg-amber-500 live-beacon shadow-lg shadow-amber-500/50' : 'bg-amber-500'}`} />
                    Pending ({pending.length})
                </button>
                <button
                    onClick={() => setActiveTab("accepted")}
                    className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 z-10 ${
                        activeTab === "accepted" ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                >
                    {activeTab === "accepted" && (
                        <motion.div layoutId="activeTab" className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 -z-10" />
                    )}
                    <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'accepted' ? 'bg-emerald-500 live-beacon shadow-lg shadow-emerald-500/50' : 'bg-emerald-500'}`} />
                    Active Queue ({accepted.length})
                </button>
            </motion.div>

            {/* ═══════ Pending Requests Section ═══════ */}
            <AnimatePresence mode="popLayout">
                {(activeTab === "all" || activeTab === "pending") && (
                    <motion.div
                        key="pending-section"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-display font-black text-slate-800 dark:text-white">
                                Action Required <span className="text-amber-500">({pending.length})</span>
                            </h2>
                        </div>

                        {loadingQueue ? (
                            <SkeletonList count={2} />
                        ) : (
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                                <AnimatePresence>
                                    {pending.map((appt) => (
                                        <motion.div key={appt._id} variants={itemVariants} exit={{ opacity: 0, scale: 0.95 }} className="space-y-2">
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-2xl glow-border-amber pointer-events-none" />
                                                <AppointmentCard
                                                    appointment={appt}
                                                    showPatient
                                                    actions={
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <button
                                                                onClick={() => respond(appt._id, "accept")}
                                                                className="px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
                                                            >
                                                                <Check className="w-4 h-4" /> Accept
                                                            </button>
                                                            <button
                                                                onClick={() => setDelayModalFor(delayModalFor === appt._id ? null : appt._id)}
                                                                className="px-4 py-2 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
                                                            >
                                                                <Clock className="w-4 h-4" /> Delay
                                                            </button>
                                                            <button
                                                                onClick={() => respond(appt._id, "reject")}
                                                                className="px-4 py-2 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
                                                            >
                                                                <X className="w-4 h-4" /> Reject
                                                            </button>
                                                        </div>
                                                    }
                                                />
                                            </div>

                                            {/* Delay Input Modal */}
                                            <AnimatePresence>
                                                {delayModalFor === appt._id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                                                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                        className="bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shadow-inner"
                                                    >
                                                        <input
                                                            type="text"
                                                            placeholder="Reason for delay (e.g., Emergency consultation)"
                                                            value={delayReason}
                                                            onChange={(e) => setDelayReason(e.target.value)}
                                                            className="flex-1 bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none w-full transition-all"
                                                        />
                                                        <div className="flex gap-2 justify-end shrink-0">
                                                            <button
                                                                onClick={() => respond(appt._id, "delay", delayReason)}
                                                                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-600/30 transition-all hover:-translate-y-0.5"
                                                            >
                                                                Confirm Delay
                                                            </button>
                                                            <button
                                                                onClick={() => setDelayModalFor(null)}
                                                                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {pending.length === 0 && (
                                    <motion.div variants={itemVariants} className="card p-10 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 border-dashed border-2">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-1">All caught up!</h3>
                                        <p className="text-sm font-medium">No pending appointment requests at the moment.</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════ Today's Queue Section ═══════ */}
            <AnimatePresence mode="popLayout">
                {(activeTab === "all" || activeTab === "accepted") && (
                    <motion.div
                        key="active-section"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                        className="space-y-4 pt-4 sm:pt-6 border-t border-slate-200/60 dark:border-slate-800"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-display font-black text-slate-800 dark:text-white">
                                Active Clinic Queue <span className="text-emerald-500">({accepted.length})</span>
                            </h2>
                        </div>

                        {loadingQueue ? (
                            <SkeletonList count={2} />
                        ) : (
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                                <AnimatePresence>
                                    {accepted.map((appt, idx) => (
                                        <motion.div key={appt._id} variants={itemVariants} exit={{ opacity: 0, scale: 0.95 }} className="relative">
                                            {idx === 0 && <div className="absolute inset-0 rounded-2xl glow-border-emerald pointer-events-none" />}
                                            <AppointmentCard
                                                appointment={appt}
                                                showPatient
                                                actions={
                                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                                                        {appt.patient?._id && (
                                                            <button
                                                                onClick={() => navigate(`/patient-history/${appt.patient._id}`)}
                                                                className="px-4 py-2.5 text-xs sm:text-sm text-primary font-bold hover:bg-primary/10 rounded-xl transition-colors flex items-center gap-1.5"
                                                            >
                                                                <FileText className="w-4 h-4" /> View History
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => markDone(appt._id)}
                                                            className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-primary hover:bg-primary-light text-white rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 transition-all hover:-translate-y-0.5 group"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Complete Visit
                                                        </button>
                                                    </div>
                                                }
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {accepted.length === 0 && (
                                    <motion.div variants={itemVariants} className="card p-12 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 border-dashed border-2">
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                                            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 relative z-10" />
                                            <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping" />
                                        </div>
                                        <h3 className="text-xl font-display font-bold text-slate-600 dark:text-slate-400 mb-2">Waiting Area is Empty</h3>
                                        <p className="text-sm font-medium max-w-sm mx-auto leading-relaxed">
                                            No patients currently in queue. Accepted appointment requests will automatically appear here in real-time.
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}