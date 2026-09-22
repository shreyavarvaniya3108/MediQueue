// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useTheme } from "../context/ThemeContext";
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     Stethoscope,
//     Calendar,
//     Clock,
//     LogOut,
//     Activity,
//     Sparkles,
//     BarChart3,
//     Sun,
//     Moon,
//     Menu,
//     X,
//     PhoneCall,
// } from "lucide-react";

// function PulseLogo() {
//     return (
//         <svg
//             viewBox="0 0 100 24"
//             className="pulse-line w-14 h-5 text-primary"
//             xmlns="http://www.w3.org/2000/svg"
//         >
//             <path d="M0 12 H30 L36 2 L44 22 L50 12 H70 L76 6 L82 18 L88 12 H100" />
//         </svg>
//     );
// }

// function ThemeToggle() {
//     const { theme, toggleTheme } = useTheme();
//     return (
//         <button
//             onClick={toggleTheme}
//             title="Toggle dark mode"
//             className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
//         >
//             {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//         </button>
//     );
// }

// export default function Navbar() {
//     const { user, logout } = useAuth();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//     useEffect(() => {
//         setMobileMenuOpen(false);
//     }, [location.pathname]);

//     function handleLogout() {
//         logout();
//         navigate("/login");
//     }

//     const isActive = (path) => location.pathname === path;

//     return (
//         <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm">
//             <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
//                 {/* Brand Logo */}
//                 <Link to="/" className="flex items-center gap-2.5 group">
//                     <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
//                         <Stethoscope className="w-5 h-5" />
//                     </div>
//                     <div className="flex flex-col">
//                         <div className="flex items-center gap-1.5">
//                             <span className="text-xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
//                                 Medi<span className="text-primary">Queue</span>
//                             </span>
//                             <PulseLogo />
//                         </div>
//                         <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 tracking-wider">
//                             Smart Medical Queue
//                         </span>
//                     </div>
//                 </Link>

//                 {/* DESKTOP Navigation Links & Live Status */}
//                 <div className="hidden md:flex items-center gap-3 sm:gap-5 text-sm">
//                     {/* Live Socket Status Pill */}
//                     {user && (
//                         <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
//                             <span className="live-beacon w-2 h-2 rounded-full bg-emerald-500" />
//                             <Activity className="w-3.5 h-3.5" />
//                             <span>Live Queue Sync</span>
//                         </div>
//                     )}

//                     {!user && (
//                         <>
//                             <Link
//                                 to="/login"
//                                 className="px-3.5 py-1.5 text-slate-600 dark:text-slate-300 font-medium hover:text-primary transition-colors"
//                             >
//                                 Log in
//                             </Link>
//                             <Link
//                                 to="/signup"
//                                 className="px-4 py-2 btn-primary rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
//                             >
//                                 <Sparkles className="w-3.5 h-3.5" />
//                                 Get Started
//                             </Link>
//                         </>
//                     )}

//                     {user && user.role === "patient" && (
//                         <nav className="flex items-center gap-2">
//                             <Link
//                                 to="/dashboard"
//                                 className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
//                                     isActive("/dashboard")
//                                         ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300 font-bold shadow-xs"
//                                         : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
//                                 }`}
//                             >
//                                 <Activity className="w-4 h-4" />
//                                 Live Queue
//                             </Link>
//                             <Link
//                                 to="/my-appointments"
//                                 className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
//                                     isActive("/my-appointments")
//                                         ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300 font-bold shadow-xs"
//                                         : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
//                                 }`}
//                             >
//                                 <Calendar className="w-4 h-4" />
//                                 My Appointments
//                             </Link>
//                         </nav>
//                     )}

//                     {user && user.role === "doctor" && (
//                         <nav className="flex items-center gap-2">
//                             <Link
//                                 to="/doctor-dashboard"
//                                 className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
//                                     isActive("/doctor-dashboard")
//                                         ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300 font-bold shadow-xs"
//                                         : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
//                                 }`}
//                             >
//                                 <Stethoscope className="w-4 h-4" />
//                                 Doctor Console
//                             </Link>
//                             <Link
//                                 to="/doctor-analytics"
//                                 className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
//                                     isActive("/doctor-analytics")
//                                         ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300 font-bold shadow-xs"
//                                         : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
//                                 }`}
//                             >
//                                 <BarChart3 className="w-4 h-4" />
//                                 Analytics
//                             </Link>
//                             <Link
//                                 to="/doctor-setup"
//                                 className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
//                                     isActive("/doctor-setup")
//                                         ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300 font-bold shadow-xs"
//                                         : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
//                                 }`}
//                             >
//                                 <Clock className="w-4 h-4" />
//                                 Clinic Settings
//                             </Link>
//                         </nav>
//                     )}

//                     <ThemeToggle />

//                     {user && (
//                         <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
//                             <div className="hidden sm:flex flex-col items-end">
//                                 <span className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</span>
//                                 <span className="text-[10px] text-primary dark:text-sky-400 capitalize font-extrabold tracking-wider bg-primary/10 dark:bg-sky-500/20 px-2 py-0.5 rounded-full border border-primary/20 dark:border-sky-500/30">
//                                     {user.role}
//                                 </span>
//                             </div>
//                             <button
//                                 onClick={handleLogout}
//                                 title="Logout"
//                                 className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
//                             >
//                                 <LogOut className="w-4 h-4" />
//                                 <span className="hidden sm:inline">Logout</span>
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 {/* MOBILE Toggle Button & Controls */}
//                 <div className="flex md:hidden items-center gap-2">
//                     <ThemeToggle />
//                     <button
//                         onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                         aria-label="Toggle Navigation Menu"
//                         className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
//                     >
//                         {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//                     </button>
//                 </div>
//             </div>

//             {/* MOBILE Drawer Menu (only visible when opened on mobile) */}
//             <AnimatePresence>
//                 {mobileMenuOpen && (
//                     <motion.div
//                         initial={{ opacity: 0, height: 0, y: -10 }}
//                         animate={{ opacity: 1, height: "auto", y: 0 }}
//                         exit={{ opacity: 0, height: 0, y: -10 }}
//                         transition={{ duration: 0.2 }}
//                         className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-4 space-y-4 shadow-xl overflow-hidden"
//                     >
//                         {user && (
//                             <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
//                                 <div className="flex flex-col">
//                                     <span className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</span>
//                                     <span className="text-[10px] text-primary dark:text-sky-400 capitalize font-extrabold tracking-wider">
//                                         Role: {user.role}
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
//                                     <span className="live-beacon w-2 h-2 rounded-full bg-emerald-500" />
//                                     <Activity className="w-3 h-3" />
//                                     <span>Live Sync</span>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Links */}
//                         {!user && (
//                             <div className="flex flex-col gap-2">
//                                 <Link
//                                     to="/login"
//                                     className="w-full text-center py-2.5 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
//                                 >
//                                     Log in
//                                 </Link>
//                                 <Link
//                                     to="/signup"
//                                     className="w-full text-center py-2.5 btn-primary rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2"
//                                 >
//                                     <Sparkles className="w-4 h-4" />
//                                     Get Started
//                                 </Link>
//                             </div>
//                         )}

//                         {user && user.role === "patient" && (
//                             <nav className="flex flex-col gap-1.5">
//                                 <Link
//                                     to="/dashboard"
//                                     className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all ${
//                                         isActive("/dashboard")
//                                             ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300"
//                                             : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
//                                     }`}
//                                 >
//                                     <Activity className="w-4 h-4" />
//                                     Live Queue
//                                 </Link>
//                                 <Link
//                                     to="/my-appointments"
//                                     className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all ${
//                                         isActive("/my-appointments")
//                                             ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300"
//                                             : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
//                                     }`}
//                                 >
//                                     <Calendar className="w-4 h-4" />
//                                     My Appointments
//                                 </Link>
//                             </nav>
//                         )}

//                         {user && user.role === "doctor" && (
//                             <nav className="flex flex-col gap-1.5">
//                                 <Link
//                                     to="/doctor-dashboard"
//                                     className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all ${
//                                         isActive("/doctor-dashboard")
//                                             ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300"
//                                             : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
//                                     }`}
//                                 >
//                                     <Stethoscope className="w-4 h-4" />
//                                     Doctor Console
//                                 </Link>
//                                 <Link
//                                     to="/doctor-analytics"
//                                     className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all ${
//                                         isActive("/doctor-analytics")
//                                             ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300"
//                                             : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
//                                     }`}
//                                 >
//                                     <BarChart3 className="w-4 h-4" />
//                                     Analytics
//                                 </Link>
//                                 <Link
//                                     to="/doctor-setup"
//                                     className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all ${
//                                         isActive("/doctor-setup")
//                                             ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300"
//                                             : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
//                                     }`}
//                                 >
//                                     <Clock className="w-4 h-4" />
//                                     Clinic Settings
//                                 </Link>
//                             </nav>
//                         )}

//                         {user && (
//                             <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
//                                 <button
//                                     onClick={handleLogout}
//                                     className="w-full py-2.5 px-4 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 text-xs font-bold flex items-center justify-center gap-2"
//                                 >
//                                     <LogOut className="w-4 h-4" />
//                                     Logout
//                                 </button>
//                             </div>
//                         )}
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </header>
//     );
// }





import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Stethoscope,
    Calendar,
    Clock,
    LogOut,
    Activity,
    Sparkles,
    BarChart3,
    Sun,
    Moon,
    Menu,
    X,
} from "lucide-react";

const NAV_ITEMS = {
    patient: [
        { path: "/dashboard", label: "Live Queue", icon: Activity },
        { path: "/my-appointments", label: "My Appointments", icon: Calendar },
    ],
    doctor: [
        { path: "/doctor-dashboard", label: "Doctor Console", icon: Stethoscope },
        { path: "/doctor-analytics", label: "Analytics", icon: BarChart3 },
        { path: "/doctor-setup", label: "Clinic Settings", icon: Clock },
    ],
};

function PulseLogo() {
    return (
        <svg
            viewBox="0 0 100 24"
            className="pulse-line w-14 h-5 text-primary"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M0 12 H30 L36 2 L44 22 L50 12 H70 L76 6 L82 18 L88 12 H100" />
        </svg>
    );
}

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            title="Toggle dark mode"
            className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
    );
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    const isActive = (path) => location.pathname === path;
    const roleNavItems = user?.role ? NAV_ITEMS[user.role] || [] : [];

    return (
        <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                        <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Medi<span className="text-primary">Queue</span>
                            </span>
                            <PulseLogo />
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 tracking-wider">
                            Smart Medical Queue
                        </span>
                    </div>
                </Link>

                {/* DESKTOP Navigation Links & Live Status */}
                <div className="hidden md:flex items-center gap-3 sm:gap-5 text-sm">
                    {user && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                            <span className="live-beacon w-2 h-2 rounded-full bg-emerald-500" />
                            <Activity className="w-3.5 h-3.5" />
                            <span>Live Queue Sync</span>
                        </div>
                    )}

                    {!user ? (
                        <>
                            <Link
                                to="/login"
                                className="px-3.5 py-1.5 text-slate-600 dark:text-slate-300 font-medium hover:text-primary transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-2 btn-primary rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Get Started
                            </Link>
                        </>
                    ) : (
                        <nav className="flex items-center gap-2">
                            {roleNavItems.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${isActive(path)
                                            ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300 shadow-xs"
                                            : "text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    <ThemeToggle />

                    {user && (
                        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</span>
                                <span className="text-[10px] text-primary dark:text-sky-400 capitalize font-extrabold tracking-wider bg-primary/10 dark:bg-sky-500/20 px-2 py-0.5 rounded-full border border-primary/20 dark:border-sky-500/30">
                                    {user.role}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* MOBILE Toggle Button */}
                <div className="flex md:hidden items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Navigation Menu"
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* MOBILE Drawer Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-4 space-y-4 shadow-xl overflow-hidden"
                    >
                        {user && (
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</span>
                                    <span className="text-[10px] text-primary dark:text-sky-400 capitalize font-extrabold tracking-wider">
                                        Role: {user.role}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                                    <span className="live-beacon w-2 h-2 rounded-full bg-emerald-500" />
                                    <Activity className="w-3 h-3" />
                                    <span>Live Sync</span>
                                </div>
                            </div>
                        )}

                        {!user ? (
                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/login"
                                    className="w-full text-center py-2.5 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    className="w-full text-center py-2.5 btn-primary rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Get Started
                                </Link>
                            </div>
                        ) : (
                            <nav className="flex flex-col gap-1.5">
                                {roleNavItems.map(({ path, label, icon: Icon }) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all ${isActive(path)
                                                ? "bg-primary/10 text-primary dark:bg-sky-500/20 dark:text-sky-300"
                                                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </Link>
                                ))}
                            </nav>
                        )}

                        {user && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2.5 px-4 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 text-xs font-bold flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}