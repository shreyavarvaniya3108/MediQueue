import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SkeletonCard } from "./Skeleton";

/**
 * Wrap any page that needs login.
 * Pass `role="doctor"` or `role="patient"` to restrict by role.
 */
export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="max-w-md mx-auto my-12 px-4 space-y-4">
                <SkeletonCard />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        const correctPath = user.role === "doctor" ? "/doctor-dashboard" : "/dashboard";
        return <Navigate to={correctPath} replace />;
    }

    return children;
}
