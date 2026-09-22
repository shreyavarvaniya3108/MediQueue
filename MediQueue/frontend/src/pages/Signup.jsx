
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import {
    Stethoscope,
    User,
    Phone,
    Lock,
    UserCheck,

    Building2,
    Award,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Signup() {
    const [role, setRole] = useState("patient");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [specialization, setSpecialization] = useState("");
    const [clinicName, setClinicName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await axiosInstance.post("/auth/signup", {
                name,
                phone,
                password,
                role,
                specialization: role === "doctor" ? specialization : "",
                clinicName: role === "doctor" ? clinicName : "",
            });

            alert("Account created successfully! Please log in.");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 relative">
            {/* Background Decorative Blur */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50 dark:shadow-none relative backdrop-blur-sm"
            >
                {/* Header Section */}
                <div className="text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-primary/25">
                        <Stethoscope className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                            Create Account
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Join MediQueue to manage queues & appointments
                        </p>
                    </div>
                </div>

                {/* Account Role Selector */}
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl relative">
                    <button
                        type="button"
                        onClick={() => setRole("patient")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative z-10 ${role === "patient"
                            ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                    >
                        <User className="w-4 h-4" /> Patient
                    </button>

                    <button
                        type="button"
                        onClick={() => setRole("doctor")}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative z-10 ${role === "doctor"
                            ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                    >
                        <Stethoscope className="w-4 h-4" /> Doctor
                    </button>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder={role === "doctor" ? "Dr. John Doe" : "John Doe"}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            Mobile Number
                        </label>
                        <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-1">
                            We'll send updates here when your turn is coming up.
                        </p>
                    </div>

                    {/* 4-Digit PIN */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            4-Digit PIN Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••"
                                value={password}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || (/^\d+$/.test(val) && val.length <= 4)) {
                                        setPassword(val);
                                    }
                                }}
                                maxLength={4}
                                pattern="\d{4}"
                                title="Password must be exactly 4 digits"
                                inputMode="numeric"
                                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all tracking-widest"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Doctor-Specific Fields */}
                    <AnimatePresence>
                        {role === "doctor" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4 pt-1 overflow-hidden"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        Specialization
                                    </label>
                                    <div className="relative">
                                        <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="e.g. General Physician, Cardiologist"
                                            value={specialization}
                                            onChange={(e) => setSpecialization(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            required={role === "doctor"}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        Clinic Name
                                    </label>
                                    <div className="relative">
                                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="e.g. City Care Health Clinic"
                                            value={clinicName}
                                            onChange={(e) => setClinicName(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            required={role === "doctor"}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Banner */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 font-medium"
                        >
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-md shadow-primary/20 hover:shadow-lg active:scale-[0.99]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
                            </>
                        ) : (
                            <>
                                <UserCheck className="w-4 h-4" /> Create Account
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary font-bold hover:underline ml-0.5">
                            Log in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}