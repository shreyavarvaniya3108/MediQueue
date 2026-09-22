import { formatDate, statusColor } from "../utils/helpers";
import { User, Stethoscope, Clock, AlertTriangle, Calendar, CheckCircle2, ShieldAlert, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { getDoctorAvatar } from "../utils/doctorAvatars";

/**
 * Reusable card for showing one appointment.
 * Pass `actions` (a React node) if the doctor needs Accept/Reject/Delay/Done buttons.
 */
export default function AppointmentCard({ appointment, showPatient = false, actions }) {
    const isAccepted = appointment.status === "accepted";
    const isDelayed = appointment.status === "delayed";
    const isPending = appointment.status === "pending";
    const isCompleted = appointment.status === "completed";
    const isRejected = appointment.status === "rejected";

    const doctorAvatar = appointment.doctor ? getDoctorAvatar(appointment.doctor) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className={`card p-4 sm:p-5 relative overflow-hidden transition-all hover:shadow-lg ${
                isAccepted ? "border-l-4 border-l-emerald-500 bg-white dark:bg-slate-800/90" : ""
            } ${isDelayed ? "border-l-4 border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/30" : ""} ${
                isPending ? "border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/30" : ""
            } ${isCompleted ? "border-l-4 border-l-slate-400 bg-slate-50/50 dark:bg-slate-900/60" : ""}`}
        >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="space-y-2 flex-1">
                    {/* Header Person Info */}
                    <div className="flex items-center gap-3">
                        {showPatient ? (
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                                <User className="w-5 h-5" />
                            </div>
                        ) : (
                            <div className="relative shrink-0">
                                <img
                                    src={doctorAvatar}
                                    alt="Doctor Avatar"
                                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-primary/20 shadow-md"
                                />
                                <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800" title="Verified Active Doctor" />
                            </div>
                        )}
                        <div>
                            {showPatient && (
                                <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                                    {appointment.patient?.name}
                                    {appointment.patient?.age && (
                                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-normal text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                                            {appointment.patient.age} yrs
                                        </span>
                                    )}
                                </h3>
                            )}
                            {!showPatient && appointment.doctor?.user && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                                        Dr. {appointment.doctor.user.name}
                                    </h3>
                                    <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/20" title="Verified Specialist" />
                                    {appointment.doctor.specialization && (
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300">
                                            {appointment.doctor.specialization}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    {formatDate(appointment.bookedAt)}
                                </span>
                                {showPatient && appointment.patient?.phone && (
                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">Phone: {appointment.patient.phone}</span>
                                )}
                                {!showPatient && appointment.doctor?.clinicName && (
                                    <span className="font-medium text-slate-600 dark:text-slate-300">🏥 {appointment.doctor.clinicName}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reason for visit */}
                    {appointment.reason && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Reason:</span> {appointment.reason}
                        </p>
                    )}

                    {/* Live Queue Position Details */}
                    {isAccepted && (
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 live-beacon" />
                                Position #{appointment.queuePosition} in Queue
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-sky-300 text-xs font-semibold border border-blue-200 dark:border-blue-800/60">
                                <Clock className="w-3.5 h-3.5" />
                                Est. Wait: {appointment.estimatedWaitTime} mins
                            </div>
                        </div>
                    )}

                    {/* Delay Notice */}
                    {isDelayed && appointment.delayReason && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-medium">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Delay Reason: {appointment.delayReason}</span>
                        </div>
                    )}
                </div>

                {/* Status Badge & Action Controls */}
                <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold capitalize inline-flex items-center gap-1 ${statusColor(
                            appointment.status
                        )}`}
                    >
                        {isAccepted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isDelayed && <Clock className="w-3.5 h-3.5" />}
                        {isPending && <Clock className="w-3.5 h-3.5" />}
                        {isRejected && <ShieldAlert className="w-3.5 h-3.5" />}
                        {appointment.status}
                    </span>
                    {actions}
                </div>
            </div>
        </motion.div>
    );
}
