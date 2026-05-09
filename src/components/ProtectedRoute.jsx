// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// Usage:
//   <ProtectedRoute>            → any logged-in user
//   <ProtectedRoute adminOnly>  → admins only
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

  if (adminOnly && role !== "admin") {
    return <Navigate to="/courses" replace />;
  }

  return children;
}