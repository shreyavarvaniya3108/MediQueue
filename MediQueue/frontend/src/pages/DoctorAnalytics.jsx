import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import axiosInstance from "../api/axiosInstance";
import { SkeletonCard } from "../components/Skeleton";
import { TrendingUp, Users, Clock, Activity, BarChart3, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function StatCard({ label, value, sublabel, icon: Icon, color = "text-primary" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 sm:p-5 relative overflow-hidden group hover:border-primary/40 transition-all hover:shadow-lg"
        >
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                    {label}
                </p>
                {Icon && (
                    <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
            </div>
            <p className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                {value}
            </p>
            {sublabel && <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-400 mt-1 font-medium">{sublabel}</p>}
        </motion.div>
    );
}

export default function DoctorAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    async function fetchAnalytics() {
        try {
            const res = await axiosInstance.get("/analytics/summary");
            setData(res.data);
        } catch (err) {
            console.log("Could not load analytics", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto mt-8 px-4 space-y-4">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-4xl mx-auto mt-8 px-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Analytics data is not available yet.</p>
            </div>
        );
    }

    const trendData = data.dailyTrend.map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }),
    }));

    const peakHoursData = data.peakHours.map((h) => ({
        hourLabel: `${h.hour}:00`,
        count: h.count,
    }));

    return (
        <div className="max-w-4xl mx-auto my-6 sm:my-8 px-3 sm:px-4 space-y-6 sm:space-y-8 pb-12">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                        Clinic Analytics & Performance
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Insights on patient visits, peak clinic hours, and wait times</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Seen Today" value={data.todayCount} icon={Users} color="text-emerald-500" />
                <StatCard label="Seen This Week" value={data.weekCount} icon={Calendar} color="text-blue-500" />
                <StatCard label="Total Consultations" value={data.totalCount} icon={TrendingUp} color="text-indigo-500" />
                <StatCard
                    label="Avg Consultation"
                    value={`${data.avgConsultationTime} min`}
                    sublabel="Auto-updates nightly"
                    icon={Clock}
                    color="text-amber-500"
                />
            </div>

            <div className="card p-4 sm:p-5 animate-fade-in-up overflow-hidden">
                <h2 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Patients seen — last 7 days</h2>
                <div className="w-full h-52 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e3ecfa" />
                            <XAxis dataKey="label" stroke="#5B6B7D" fontSize={11} />
                            <YAxis allowDecimals={false} stroke="#5B6B7D" fontSize={11} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="patientsSeen"
                                stroke="#1863DC"
                                strokeWidth={2.5}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card p-4 sm:p-5 animate-fade-in-up overflow-hidden">
                <h2 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    Average consultation time — last 7 days (min)
                </h2>
                <div className="w-full h-52 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e3ecfa" />
                            <XAxis dataKey="label" stroke="#5B6B7D" fontSize={11} />
                            <YAxis allowDecimals={false} stroke="#5B6B7D" fontSize={11} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="avgTime"
                                stroke="#17A673"
                                strokeWidth={2.5}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card p-4 sm:p-5 animate-fade-in-up overflow-hidden">
                <h2 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Busiest hours (all-time)</h2>
                {peakHoursData.length === 0 ? (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Not enough data yet to show peak hours.</p>
                ) : (
                    <div className="w-full h-52 sm:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={peakHoursData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e3ecfa" />
                                <XAxis dataKey="hourLabel" stroke="#5B6B7D" fontSize={11} />
                                <YAxis allowDecimals={false} stroke="#5B6B7D" fontSize={11} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#1863DC" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}

