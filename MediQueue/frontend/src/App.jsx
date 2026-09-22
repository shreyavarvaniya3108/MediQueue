import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PatientDashboard from "./pages/PatientDashboard";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientHistory from "./pages/PatientHistory";
import DoctorSetup from "./pages/DoctorSetup";
import DoctorAnalytics from "./pages/DoctorAnalytics";

function PublicOnlyRoute({ children }) {
    const { user } = useAuth();
    if (user) {
        return <Navigate to={user.role === "doctor" ? "/doctor-dashboard" : "/dashboard"} replace />;
    }
    return children;
}

// Home ("/"): if logged in, send to the right dashboard.
// If not logged in, send to login instead of rendering PatientDashboard directly
// (PatientDashboard assumes a logged-in user and will crash without one).
function HomeRoute() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return <Navigate to={user.role === "doctor" ? "/doctor-dashboard" : "/dashboard"} replace />;
}

export default function App() {
    return (
        <div>
            <Navbar />

            <Routes>
                <Route path="/" element={<HomeRoute />} />

                <Route
                    path="/login"
                    element={
                        <PublicOnlyRoute>
                            <Login />
                        </PublicOnlyRoute>
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <PublicOnlyRoute>
                            <Signup />
                        </PublicOnlyRoute>
                    }
                />

                {/* Patient & Clinic Booking routes (accessible to any authenticated user) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/book/:doctorId"
                    element={
                        <ProtectedRoute>
                            <BookAppointment />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/my-appointments"
                    element={
                        <ProtectedRoute>
                            <MyAppointments />
                        </ProtectedRoute>
                    }
                />

                {/* Doctor routes */}
                <Route
                    path="/doctor-dashboard"
                    element={
                        <ProtectedRoute role="doctor">
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/doctor-setup"
                    element={
                        <ProtectedRoute role="doctor">
                            <DoctorSetup />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/doctor-analytics"
                    element={
                        <ProtectedRoute role="doctor">
                            <DoctorAnalytics />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/patient-history/:patientId"
                    element={
                        <ProtectedRoute role="doctor">
                            <PatientHistory />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
}