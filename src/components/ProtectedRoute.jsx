// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, role, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Allow both 'admin' and 'superadmin' to access admin routes
  if (adminOnly && role !== "admin" && role !== "superadmin") {
    return <Navigate to="/courses" replace />;
  }

  return children;
}