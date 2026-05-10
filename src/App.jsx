import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }      from "./context/AuthContext.jsx";
import ProtectedRoute        from "./components/ProtectedRoute.jsx";
import AppShell              from "./components/layout/AppShell";
import LoginPage             from "./pages/LoginPage";
import HomePage              from "./pages/HomePage";
import CourseListPage        from "./pages/CourseListPage";
import CurriculumMapPage     from "./pages/CurriculumMapPage";
import AboutPage             from "./pages/AboutPage";
import RoadmapPage           from "./pages/RoadmapPage";
import UserManagementPage    from "./pages/UserManagementPage";   // ← ADD

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/"        element={<Navigate to="/home" replace />} />
          <Route path="/home"    element={<ProtectedLayout><HomePage /></ProtectedLayout>} />
          <Route path="/courses" element={<ProtectedLayout><CourseListPage /></ProtectedLayout>} />
          <Route path="/map"     element={<ProtectedLayout><CurriculumMapPage /></ProtectedLayout>} />
          <Route path="/roadmap" element={<ProtectedLayout><RoadmapPage /></ProtectedLayout>} />
          <Route path="/about"   element={<ProtectedLayout><AboutPage /></ProtectedLayout>} />

          {/* Admin only */}
          <Route path="/users" element={
            <ProtectedRoute adminOnly>
              <AppShell><UserManagementPage /></AppShell>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}