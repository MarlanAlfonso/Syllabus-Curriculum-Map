import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import "./index.css";
import HomePage from "./pages/HomePage";
import CourseListPage from "./pages/CourseListPage";
import CurriculumMapPage from "./pages/CurriculumMapPage";
import AboutPage from "./pages/AboutPage";
import ProtectedRoute from "./components/ProtectedRoute";

export function App() {
  return (
    <BrowserRouter>
      <nav className="bg-blue-700 text-white px-6 py-3 flex gap-6">
        <NavLink to="/home" className={({ isActive }) => isActive ? "font-bold underline" : ""}>Home</NavLink>
        <NavLink to="/courses" className={({ isActive }) => isActive ? "font-bold underline" : ""}>Courses</NavLink>
        <NavLink to="/map" className={({ isActive }) => isActive ? "font-bold underline" : ""}>Map</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? "font-bold underline" : ""}>About</NavLink>
      </nav>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/courses" element={<ProtectedRoute><CourseListPage /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><CurriculumMapPage /></ProtectedRoute>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
