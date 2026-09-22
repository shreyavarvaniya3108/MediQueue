import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import socket from "../socket/socket";
import WaitTimeDisplay from "../components/WaitTimeDisplay";
import NotificationToast from "../components/NotificationToast";
import { SkeletonList } from "../components/Skeleton";
import {
    Stethoscope,
    Clock,
    MapPin,
    ChevronRight,
    Sparkles,
    Star,
    BadgeCheck,
    PhoneCall,
    Award,
    Activity,
    ShieldCheck,
    HeartPulse,
    X,
    CalendarPlus,
    TrendingUp,
    Zap,
    Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDoctorAvatar, getDoctorRating } from "../utils/doctorAvatars";

const SYMPTOM_TRIAGE_LIST = [
    { label: "All Doctors", icon: "🩺", spec: "All" },
    { label: "AI Scan (Beta)", icon: "✨", spec: "AI", action: "alert" },
    { label: "Emergency", icon: "🚨", spec: "Emergency", action: "emergency" },
];

// Staggered children animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 260, damping: 24 },
    },
};

export default function PatientDashboard() {
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [activeAppointment, setActiveAppointment] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const [selectedSymptom, setSelectedSymptom] = useState("All");
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([fetchDoctors(), fetchActiveAppointment()]);

        if (user?.id) socket.emit("join", user.id);
        if (user?._id) socket.emit("join", user._id);

        const onConnect = () => {
            if (user?.id) socket.emit("join", user.id);
            if (user?._id) socket.emit("join", user._id);
        };

        const onWaitingTimeUpdated = (data) => {
            setActiveAppointment((prev) => {
                if (prev && (prev._id === data.appointmentId || prev._id === data.appointment?._id)) {
                    return {
                        ...prev,
                        estimatedWaitTime: data.estimatedWaitTime,
                        queuePosition: data.queuePosition,
                    };
                }
                return prev;
            });
            fetchActiveAppointment();
        };

        const onStatusUpdated = (data) => {
            const updated = data?.appointment || data;
            const status = updated?.status;
            if (status === "accepted" || status === "delayed") {
                setToastMessage("🎉 Your appointment request was accepted by the doctor!");
                fetchActiveAppointment();
            } else if (status === "rejected") {
                setToastMessage("⚠️ Your appointment request was rejected.");
                setActiveAppointment(null);
                fetchActiveAppointment();
            } else if (status === "completed") {
                setToastMessage("✅ Your consultation has been completed. Thank you!");
                setActiveAppointment(null);
                fetchActiveAppointment();
            } else {
                fetchActiveAppointment();
            }
        };

        const onDelayNotification = (data) => {
            setToastMessage(data.message || "Your doctor requested a slight delay.");
            fetchActiveAppointment();
        };

        const onQueueUpdated = () => {
            fetchActiveAppointment();
        };

        socket.on("connect", onConnect);
        socket.on("waiting-time-updated", onWaitingTimeUpdated);
        socket.on("appointment-status-updated", onStatusUpdated);
        socket.on("delay-notification", onDelayNotification);
        socket.on("queue-updated", onQueueUpdated);

        return () => {
            socket.off("connect", onConnect);
            socket.off("waiting-time-updated", onWaitingTimeUpdated);
            socket.off("appointment-status-updated", onStatusUpdated);
            socket.off("delay-notification", onDelayNotification);
            socket.off("queue-updated", onQueueUpdated);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    async function fetchDoctors() {
        try {
            const res = await axiosInstance.get("/doctors");
            setDoctors(res.data);
        } catch (err) {
            console.log("Could not load doctors", err);
        } finally {
            setLoadingDoctors(false);
        }
    }

    async function fetchActiveAppointment() {
        try {
            const res = await axiosInstance.get("/appointments/my");
            const active = res.data.find((a) => ["pending", "accepted", "delayed"].includes(a.status));
            setActiveAppointment(active || null);
        } catch (err) {
            console.log("Could not load appointments", err);
        }
    }

    const filteredDoctors = doctors.filter((doc) => {
        if (selectedSymptom === "All") return true;
        const spec = (doc.specialization || "").toLowerCase();
        return spec.includes(selectedSymptom.toLowerCase());
    });

    return (
        <div className="max-w-5xl mx-auto my-6 sm:my-8 px-3 sm:px-4 space-y-6 sm:space-y-8">
            <NotificationToast message={toastMessage} onClose={() => setToastMessage("")} />

            {/* ═══════ Live Hospital Vitals Ticker ═══════ */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-900 text-white py-2.5 px-5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg border border-slate-800 overflow-hidden relative"
            >
                {/* Shimmer sweep */}
                <div className="absolute inset-0 shimmer-badge pointer-events-none opacity-30" />

                <div className="flex items-center gap-2 relative z-10">
                    <span className="live-beacon w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">LIVE PULSE</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] overflow-x-auto no-scrollbar relative z-10">
                    <span className="flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Clinic: Optimal
                    </span>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Avg Wait: &lt; 8 min
                    </span>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> HIPAA Verified
                    </span>
                </div>
            </motion.div>

            {/* ═══════ Patient Hero Banner ═══════ */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="medical-gradient animate-gradient-shift rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden"
            >
                {/* Floating decorative elements */}
                <div className="absolute -right-8 -bottom-8 opacity-[0.07] pointer-events-none animate-float-up">
                    <Stethoscope className="w-72 h-72" />
                </div>
                <div className="absolute top-4 right-20 w-20 h-20 bg-sky-400/10 rounded-full blur-2xl animate-float-slow pointer-events-none" />
                <div className="absolute bottom-4 left-10 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl animate-float-up pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-md border border-white/10"
                        >
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> MediQueue Smart Healthcare Portal
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight"
                        >
                            Welcome, {user?.name}!
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-blue-100 text-xs sm:text-sm font-medium max-w-xl leading-relaxed"
                        >
                            Connect with certified specialists, track live clinic queues, and reduce your waiting time.
                        </motion.p>
                    </div>

                    {/* Right-side actions */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col gap-2.5 shrink-0"
                    >
                        <button
                            onClick={() => setShowEmergencyModal(true)}
                            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center gap-3 transition-all text-left group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-rose-400/20 text-rose-300 flex items-center justify-center font-bold group-hover:bg-rose-400/30 transition-colors">
                                <PhoneCall className="w-4 h-4 animate-gentle-bounce" />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-blue-200 block">Emergency</span>
                                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">1800-MEDI-QUEUE</span>
                            </div>
                        </button>
                        <div className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 live-beacon" />
                            <span>Real-Time Socket Sync</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* ═══════ Active Appointment Queue Section ═══════ */}
            <AnimatePresence>
                {activeAppointment && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary live-beacon" />
                            <h2 className="text-base font-display font-bold text-slate-800 dark:text-white">
                                Your Live Active Consultation
                            </h2>
                        </div>
                        <WaitTimeDisplay
                            waitTime={["accepted", "delayed"].includes(activeAppointment.status) ? activeAppointment.estimatedWaitTime : null}
                            queuePosition={activeAppointment.queuePosition}
                            doctorName={activeAppointment.doctor?.user?.name}
                            clinicName={activeAppointment.doctor?.clinicName}
                            status={activeAppointment.status}
                            delayReason={activeAppointment.delayReason}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════ Smart Action Hub ═══════ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="card p-5 space-y-3 bg-gradient-to-br from-sky-50/50 via-white to-blue-50/50 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 shadow-md relative overflow-hidden"
            >
                {/* Animated background decoration */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"
                />

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                            <Zap className="w-4 h-4 text-primary" />
                        </motion.div>
                        <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white">
                            Smart Action Hub
                        </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">Quick Actions</span>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar relative z-10">
                    {SYMPTOM_TRIAGE_LIST.map((st, i) => {
                        const isSelected = selectedSymptom === st.spec;
                        return (
                            <motion.button
                                key={st.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (st.action === "emergency") setShowEmergencyModal(true);
                                    else if (st.action === "alert") alert("AI Auto-Scan feature is coming in the next update!");
                                    else setSelectedSymptom(st.spec);
                                }}
                                className={`px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                                    isSelected && !st.action
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : st.action === "emergency"
                                            ? "bg-rose-50 text-rose-600 border border-rose-200 shadow-sm hover:bg-rose-100"
                                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary/40"
                                }`}
                            >
                                <span className={st.action === "emergency" ? "animate-pulse" : ""}>{st.icon}</span>
                                <span>{st.label}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* ═══════ Available Doctors Grid ═══════ */}
            <div className="space-y-5">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300 flex items-center justify-center font-bold shrink-0">
                            <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white">
                                Certified Doctors & Specialists
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">Select a doctor to book an appointment instantly</p>
                        </div>
                    </div>
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 w-fit flex items-center gap-1.5"
                    >
                        <Users className="w-3.5 h-3.5" />
                        {filteredDoctors.length} Doctors Available
                    </motion.span>
                </motion.div>

                {/* Doctor Cards */}
                {loadingDoctors ? (
                    <SkeletonList count={4} />
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
                    >
                        <AnimatePresence>
                            {filteredDoctors.map((doc) => {
                                const avatarUrl = getDoctorAvatar(doc);
                                const { rating, reviewsCount, experience } = getDoctorRating(doc);

                                return (
                                    <motion.div
                                        key={doc._id}
                                        variants={itemVariants}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileHover={{ y: -6, scale: 1.015 }}
                                        className="card p-5 hover:border-primary/50 dark:hover:border-sky-400/50 flex flex-col justify-between gap-4 transition-all group hover:shadow-2xl relative overflow-hidden"
                                    >
                                        {/* Subtle corner glow on hover */}
                                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                        <div className="space-y-3 relative z-10">
                                            {/* Doctor Avatar Header */}
                                            <div className="flex items-start gap-3.5">
                                                <div className="relative shrink-0">
                                                    <img
                                                        src={avatarUrl}
                                                        alt={`Dr. ${doc.user?.name}`}
                                                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-primary/20 shadow-md group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center" title="Active">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                                    </span>
                                                </div>

                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-1.5">
                                                            Dr. {doc.user?.name}
                                                            <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/20" title="Verified" />
                                                        </h3>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-100 dark:border-blue-800/60 text-[11px] font-bold">
                                                            {doc.specialization}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-100 dark:border-emerald-800">
                                                            <Award className="w-3 h-3 text-emerald-600" /> {experience}
                                                        </span>
                                                    </div>

                                                    {/* Rating */}
                                                    <div className="flex items-center gap-1 text-xs pt-0.5">
                                                        <div className="flex items-center text-amber-400">
                                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                            <span className="font-bold text-slate-800 dark:text-white ml-1">{rating}</span>
                                                        </div>
                                                        <span className="text-slate-400 text-[11px]">({reviewsCount} reviews)</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Clinic Details */}
                                            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{doc.clinicName}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>
                                                            {doc.clinicTiming?.start || "09:00"} - {doc.clinicTiming?.end || "17:00"}
                                                        </span>
                                                    </div>
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                                        <Activity className="w-3 h-3" /> Queue Open
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ★ Book Appointment Button ★ */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate(`/book/${doc._id}`)}
                                            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all relative overflow-hidden group/btn"
                                        >
                                            <div className="absolute inset-0 shimmer-badge opacity-0 group-hover/btn:opacity-40 transition-opacity" />
                                            <CalendarPlus className="w-4 h-4 relative z-10" />
                                            <span className="relative z-10">Book Appointment</span>
                                            <ChevronRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {filteredDoctors.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full card p-10 text-center text-slate-400"
                            >
                                <Stethoscope className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No doctors match this filter.</p>
                                <p className="text-xs text-slate-400 mt-1">Select "All Doctors" to view everyone.</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* ═══════ Quick Stats Bar ═══════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-3 gap-3"
            >
                {[
                    { icon: <Stethoscope className="w-5 h-5" />, value: doctors.length, label: "Doctors Online", color: "text-primary dark:text-sky-400", bg: "bg-primary/10 dark:bg-sky-500/20" },
                    { icon: <TrendingUp className="w-5 h-5" />, value: "< 8m", label: "Avg. Wait Time", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60" },
                    { icon: <ShieldCheck className="w-5 h-5" />, value: "99.9%", label: "Uptime", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/60" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="card p-4 text-center space-y-2 hover:shadow-lg"
                    >
                        <div className={`w-10 h-10 mx-auto rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                        <div className={`text-xl font-display font-extrabold ${stat.color} animate-count-up`}>{stat.value}</div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* ═══════ Emergency Modal ═══════ */}
            <AnimatePresence>
                {showEmergencyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.85, y: 30 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="card max-w-md w-full p-6 space-y-4 text-center bg-white dark:bg-slate-900 border-2 border-rose-500/50 shadow-2xl relative overflow-hidden"
                        >
                            {/* Decorative glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-rose-500/15 blur-3xl pointer-events-none" />

                            <button
                                onClick={() => setShowEmergencyModal(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                                <PhoneCall className="w-7 h-7 animate-bounce" />
                            </div>
                            <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">
                                24/7 Medical Emergency
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                For acute symptoms, emergencies, or rapid ambulance dispatch — connect instantly:
                            </p>
                            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-lg font-black tracking-widest">
                                📞 1800-MEDI-QUEUE
                            </div>
                            <button
                                onClick={() => setShowEmergencyModal(false)}
                                className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}