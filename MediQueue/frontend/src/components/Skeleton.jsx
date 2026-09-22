export function SkeletonLine({ width = "100%" }) {
    return (
        <div
            className="h-3 rounded-full bg-sky dark:bg-slate-700 animate-pulse"
            style={{ width }}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="card p-4 flex justify-between items-start gap-4">
            <div className="flex-1 space-y-2">
                <SkeletonLine width="40%" />
                <SkeletonLine width="65%" />
                <SkeletonLine width="30%" />
            </div>
            <div className="w-16 h-6 rounded-full bg-sky dark:bg-slate-700 animate-pulse" />
        </div>
    );
}

export function SkeletonList({ count = 3 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
