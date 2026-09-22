import { Clock, Users, Sparkles, Stethoscope, CheckCircle2, HeartPulse, UserCheck, AlertTriangle, ArrowRight, BellRing, Check } from "lucide-react";
import { motion } from "framer-motion";

function QueueStepper({ activeStep }) {
    const steps = [
        { label: "Request Sent", desc: "Submitted" },
        { label: "Doctor Accepted", desc: "Confirmed" },
        { label: "Waiting Lounge", desc: "In Queue" },
        { label: "Next in Line", desc: "Position #1" },
        { label: "Consultation", desc: "In Room" },
    ];

    return (
        <div className="w-full py-4 px-2 bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 my-3">
            <div className="relative flex items-center justify-between max-w-lg mx-auto">
                {/* Progress Connector Line */}
                <div className="absolute left-4 right-4 top-4 h-1 bg-slate-200 dark:bg-slate-700 -z-0 rounded-full" />
                <div
                    className="absolute left-4 top-4 h-1 bg-gradient-to-r from-primary via-blue-500 to-emerald-500 -z-0 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, (activeStep / (steps.length - 1)) * 100))}%` }}
                />

                {steps.map((step, idx) => {
                    const isDone = idx < activeStep;
                    const isCurrent = idx === activeStep;
                    return (
                        <div key={idx} className="relative z-10 flex flex-col items-center group">
                            <motion.div
                                animate={{ scale: isCurrent ? 1.15 : 1 }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all border-2 ${
                                    isDone
                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                                        : isCurrent
                                        ? "bg-primary text-white border-white shadow-lg ring-4 ring-primary/20 live-beacon"
                                        : "bg-white dark:bg-slate-900 text-slate-400 border-slate-300 dark:border-slate-700"
                                }`}
                            >
                                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                            </motion.div>
                            <span
                                className={`text-[10px] font-bold mt-1.5 text-center transition-colors ${
                                    isCurrent
                                        ? "text-primary dark:text-sky-400 font-extrabold"
                                        : isDone
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-slate-400"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function WaitTimeDisplay({ waitTime, queuePosition, doctorName, clinicName, status, delayReason }) {
    // Dynamic stepper step based on status
    let activeStep = 0;
    if (status === "accepted" || status === "delayed") {
        activeStep = queuePosition === 1 ? 3 : 2;
    } else if (status === "pending") {
        activeStep = 0;
    } else if (status === "completed") {
        activeStep = 4;
    }

    // 1. Fallback for completely missing data
    if (waitTime === null || waitTime === undefined) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-5 sm:p-8 text-center relative overflow-hidden bg-gradient-to-br from-blue-50/90 via-white to-sky-50/90 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-blue-200/80 dark:border-slate-700/80 shadow-lg"
            >
                <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 text-primary dark:text-sky-400 pointer-events-none">
                    <Stethoscope className="w-40 h-40" />
                </div>
                <QueueStepper activeStep={0} />
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto my-3 sm:my-4 bg-primary/10 dark:bg-sky-500/20 rounded-2xl flex items-center justify-center text-primary dark:text-sky-400 border border-primary/20 dark:border-sky-500/30 shadow-inner">
                    <HeartPulse className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse text-primary dark:text-sky-400" />
                </div>
                <h3 className="text-base sm:text-xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Consultation Request Submitted
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1.5 max-w-md mx-auto font-medium leading-relaxed">
                    Your appointment request has been sent to the clinic. Live queue position and estimated wait time will appear shortly.
                </p>
                <div className="mt-4 sm:mt-5 inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs font-bold">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 live-beacon" />
                    Status: Awaiting Doctor Approval
                </div>
            </motion.div>
        );
    }

    // 2. Position #1 Turn Banner (Adaptive High Contrast for Light & Dark Mode)
    // Only show if accepted/delayed! If pending, they can't go in yet.
    if ((queuePosition === 1 || waitTime === 0) && status !== "pending") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="card p-5 sm:p-9 text-center bg-gradient-to-br from-blue-700 via-indigo-800 to-sky-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white shadow-2xl shadow-blue-700/30 dark:shadow-[0_0_35px_rgba(14,165,233,0.3)] relative overflow-hidden border-2 border-blue-400/60 dark:border-sky-500/60"
            >
                {/* Decorative background glow */}
                <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
                    <Stethoscope className="w-56 h-56 text-white" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-sky-400/25 blur-3xl pointer-events-none" />

                <QueueStepper activeStep={activeStep} />

                <div className="relative z-10 space-y-4 sm:space-y-5 max-w-lg mx-auto">
                    {/* Priority Alert Badge */}
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-amber-400 dark:bg-amber-400 text-slate-950 dark:text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg border border-amber-300">
                        <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce text-slate-950" />
                        <span className="text-slate-950 font-black">PRIORITY CALL • POSITION #1 IN QUEUE</span>
                    </div>

                    {/* Big Checkmark Avatar */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/20 dark:bg-sky-500/20 backdrop-blur-xl rounded-3xl border-2 border-white/50 dark:border-sky-400/50 flex items-center justify-center text-white dark:text-sky-300 shadow-xl shadow-blue-950/40 dark:shadow-[0_0_25px_rgba(56,189,248,0.3)]">
                        <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 text-white dark:text-sky-300 animate-pulse" />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                        <h2 className="text-2xl sm:text-4xl font-display font-black text-white dark:text-white tracking-tight drop-shadow-md">
                            IT'S YOUR TURN NOW!
                        </h2>

                        <p className="text-blue-100 dark:text-sky-200 text-xs sm:text-base font-semibold leading-relaxed">
                            {doctorName ? `Dr. ${doctorName}` : "The Doctor"} is ready and expecting you for consultation now.
                        </p>
                    </div>

                    {/* Action Instruction Box */}
                    <div className="p-3 sm:p-4 rounded-2xl bg-white/20 dark:bg-sky-950/70 backdrop-blur-md border border-white/30 dark:border-sky-500/40 text-white dark:text-sky-100 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-inner">
                        <span>👉 Please proceed directly into the Consultation Room.</span>
                        <ArrowRight className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
                    </div>
                </div>
            </motion.div>
        );
    }

    const patientsAhead = queuePosition ? Math.max(0, queuePosition - 1) : 0;

    // 3. Active Queue Position Tracker (Queue > 1 OR status is pending)
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 sm:p-8 text-center relative overflow-hidden bg-gradient-to-br from-white via-sky-50/70 to-blue-50/90 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900 shadow-xl border border-blue-200/80 dark:border-slate-700/80"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 text-primary dark:text-sky-400 pointer-events-none">
                <Stethoscope className="w-44 h-44" />
            </div>

            <QueueStepper activeStep={activeStep} />

            <div className="relative z-10 max-w-md mx-auto space-y-4 sm:space-y-5">
                <div className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full font-bold text-xs border ${status === "pending" ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border-amber-500/20" : "bg-primary/10 text-primary dark:bg-sky-500/15 dark:text-sky-300 border-primary/20 dark:border-sky-500/30"}`}>
                    <span className={`w-2.5 h-2.5 rounded-full live-beacon ${status === "pending" ? "bg-amber-500 dark:bg-amber-400" : "bg-primary dark:bg-sky-400"}`} />
                    <Clock className="w-3.5 h-3.5" /> {status === "pending" ? "Awaiting Doctor Approval" : "Live Clinic Queue Tracker"}
                </div>

                {/* Circular Timer Gauge */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary via-blue-500 to-emerald-400 dark:from-sky-500 dark:via-blue-600 dark:to-emerald-400 opacity-25 dark:opacity-40 blur-lg animate-pulse-glow" />
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white dark:bg-slate-950 shadow-2xl border-4 border-primary/30 dark:border-sky-500/40 flex flex-col items-center justify-center relative">
                        <span className="text-3xl sm:text-5xl font-display font-black text-slate-900 dark:text-white animate-heartbeat">
                            {waitTime}
                        </span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-wider mt-0.5 sm:mt-1">
                            Est. Wait (Mins)
                        </span>
                    </div>
                </div>

                {/* Delay Alert */}
                {delayReason && (
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 justify-center">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Doctor Update: {delayReason}</span>
                    </div>
                )}

                {/* Queue Position and Patients Ahead Grid */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                    <div className="bg-white dark:bg-slate-800/90 p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-3xl font-display font-black text-primary dark:text-sky-400">
                            #{queuePosition}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1 mt-1">
                            <UserCheck className="w-3.5 h-3.5 text-primary dark:text-sky-400" /> Your Spot
                        </span>
                    </div>

                    <div className="bg-white dark:bg-slate-800/90 p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-3xl font-display font-black text-emerald-600 dark:text-emerald-400">
                            {patientsAhead}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1 mt-1">
                            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Ahead
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
