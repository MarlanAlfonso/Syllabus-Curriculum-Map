// src/App.jsx — ADD the roadmap route (diff shown below)
// ──────────────────────────────────────────────────────────────────────────────
// CHANGES from original:
//   1. Import RoadmapPage
//   2. Add <Route path="/roadmap" ... /> inside the protected block
// ──────────────────────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import CourseListPage from "./pages/CourseListPage";
import CurriculumMapPage from "./pages/CurriculumMapPage";
import AboutPage from "./pages/AboutPage";
import RoadmapPage from "./pages/RoadmapPage";   // ← NEW

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
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home"    element={<ProtectedLayout><HomePage /></ProtectedLayout>} />
          <Route path="/courses" element={<ProtectedLayout><CourseListPage /></ProtectedLayout>} />
          <Route path="/map"     element={<ProtectedLayout><CurriculumMapPage /></ProtectedLayout>} />
          <Route path="/about"   element={<ProtectedLayout><AboutPage /></ProtectedLayout>} />

          {/* ─── NEW ─────────────────────────────────────────────────────── */}
          <Route path="/roadmap" element={<ProtectedLayout><RoadmapPage /></ProtectedLayout>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}