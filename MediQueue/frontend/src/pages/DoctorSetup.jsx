import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import socket from "../socket/socket";
import { Stethoscope, Building, Clock, AlertTriangle, Save, CheckCircle2, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DOCTOR_AVATARS, getDoctorAvatar } from "../utils/doctorAvatars";

export default function DoctorSetup() {
    const [profile, setProfile] = useState(null);
    const [specialization, setSpecialization] = useState("");
    const [clinicName, setClinicName] = useState("");
    const [start, setStart] = useState("09:00");
    const [end, setEnd] = useState("17:00");
    const [lateMinutes, setLateMinutes] = useState(15);
    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await axiosInstance.get("/doctors/me/profile");
            setProfile(res.data);
            setSpecialization(res.data.specialization);
            setClinicName(res.data.clinicName);
            setStart(res.data.clinicTiming?.start || "09:00");
            setEnd(res.data.clinicTiming?.end || "17:00");
            setLateMinutes(Math.min(res.data.lateExtraMinutes || 15, 120));
            setSelectedAvatar(getDoctorAvatar(res.data));
        } catch (err) {
            console.log("Could not load profile", err);
        }
    }

    async function saveProfile(e) {
        e.preventDefault();
        try {
            await axiosInstance.put("/doctors/setup", {
                specialization,
                clinicName,
                clinicTiming: { start, end },
            });
            setMessage("✅ Clinic setup saved successfully.");
            setTimeout(() => setMessage(""), 4000);
            fetchProfile();
        } catch (err) {
            setMessage("❌ Could not update profile.");
        }
    }

    async function toggleRunningLate() {
        try {
            const res = await axiosInstance.put("/doctors/running-late", {
                isRunningLate: !profile.isRunningLate,
                lateExtraMinutes: lateMinutes,
            });
            setProfile(res.data);

            if (res.data.isRunningLate) {
                socket.emit("doctor-running-late", { doctorId: profile._id, extraMinutes: lateMinutes });
            }
        } catch (err) {
            console.log("Could not update status", err);
        }
    }

    if (!profile) return null;

    return (
        <div className="max-w-xl mx-auto my-6 sm:my-8 px-3 sm:px-4 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5 sm:p-8 space-y-6 shadow-xl"
            >
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                        <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white">
                            Clinic Profile & Timings
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Configure your medical practice schedule and specialization
                        </p>
                    </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-5">
                    {/* Doctor Avatar Picker Display */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary" /> Active Doctor Profile Avatar
                        </label>
                        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                            {DOCTOR_AVATARS.map((av) => {
                                const isSel = selectedAvatar === av.url;
                                return (
                                    <button
                                        key={av.id}
                                        type="button"
                                        onClick={() => setSelectedAvatar(av.url)}
                                        className={`relative shrink-0 p-1 rounded-2xl transition-all ${
                                            isSel
                                                ? "ring-4 ring-primary shadow-lg scale-105"
                                                : "opacity-75 hover:opacity-100 hover:scale-100"
                                        }`}
                                    >
                                        <img
                                            src={av.url}
                                            alt={av.name}
                                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover"
                                        />
                                        {isSel && (
                                            <span className="absolute -top-1 -right-1 bg-primary text-white p-0.5 rounded-full">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-primary" /> Specialization / Field
                        </label>
                        <input
                            type="text"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            placeholder="e.g. Cardiologist, General Physician"
                            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-primary" /> Clinic / Hospital Name
                        </label>
                        <input
                            type="text"
                            value={clinicName}
                            onChange={(e) => setClinicName(e.target.value)}
                            placeholder="e.g. City Health Medical Center"
                            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" /> Daily Clinic Operating Hours
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 font-medium">Start Time</span>
                                <input
                                    type="time"
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 font-medium">End Time</span>
                                <input
                                    type="time"
                                    value={end}
                                    onChange={(e) => setEnd(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button className="w-full btn-primary py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md">
                        <Save className="w-4 h-4" /> Save Clinic Profile
                    </button>

                    {message && (
                        <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-medium text-center">
                            {message}
                        </p>
                    )}
                </form>
            </motion.div>

            {/* Running Late Status Box */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card p-6 sm:p-8 space-y-4 border-2 ${
                    profile.isRunningLate
                        ? "border-amber-400 bg-amber-50/40"
                        : "border-slate-200"
                }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                                profile.isRunningLate
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-100 text-emerald-700"
                            }`}
                        >
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-display font-bold text-slate-900">
                                Live Delay & Queue Warning Status
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Instantly notify all waiting patients if your clinic schedule is delayed
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Current Clinic Status:</span>
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            profile.isRunningLate
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${
                                profile.isRunningLate ? "bg-amber-500 live-beacon" : "bg-emerald-500"
                            }`}
                        />
                        {profile.isRunningLate
                            ? `Running Late (+${profile.lateExtraMinutes} mins)`
                            : "On Schedule"}
                    </span>
                </div>

                {!profile.isRunningLate && (
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">
                            Extra Delay Minutes to add to each waiting patient:
                        </label>
                        <input
                            type="number"
                            min={5}
                            max={120}
                            value={lateMinutes}
                            onChange={(e) => setLateMinutes(Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>
                )}

                <button
                    onClick={toggleRunningLate}
                    className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                        profile.isRunningLate
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                            : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                    }`}
                >
                    {profile.isRunningLate ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" /> Reset Status to On Schedule
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="w-4 h-4" /> Broadcast Running Late Alert
                        </>
                    )}
                </button>
            </motion.div>
        </div>
    );
}
