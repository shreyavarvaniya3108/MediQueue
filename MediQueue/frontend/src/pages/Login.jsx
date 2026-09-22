import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Stethoscope, Phone, Lock, LogIn, User, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axiosInstance.post("/auth/login", { username, phone, password });
            login(res.data.user, res.data.token);
            navigate(res.data.user.role === "doctor" ? "/doctor-dashboard" : "/dashboard");

            // Clear input fields after successful login
            setUsername("");
            setPhone("");
            setPassword("");
        } catch (err) {
            if (err.response?.status === 401 && err.response?.data?.message?.includes("User not found")) {
                setError("User not found. Please click 'Sign up now' below to create a new account.");
            } else {
                setError(err.response?.data?.message || "Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 relative">
            {/* Background Decorative Gradient Blurs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50 dark:shadow-none relative backdrop-blur-sm"
            >
                {/* Header / Brand */}
                <div className="text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-primary/25">
                        <Stethoscope className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Log in to access your MediQueue account
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name Field */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Mobile Number Field */}
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
                    </div>

                    {/* 4-digit PIN Field */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                            <span>4-Digit PIN Password</span>
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
                                <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" /> Log In to Portal
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Don't have an account yet?{" "}
                        <Link to="/signup" className="text-primary font-bold hover:underline ml-0.5">
                            Sign up now
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
