export function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function statusColor(status) {
    const colors = {
        pending: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/50",
        accepted: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/50",
        rejected: "bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/50",
        delayed: "bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-700/50",
        completed: "bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/60 dark:text-sky-300 dark:border-blue-700/50",
    };
    return colors[status] || "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
}

