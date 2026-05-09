import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import "./index.css";
import HomePage from "./pages/HomePage";
import CourseListPage from "./pages/CourseListPage";
import CurriculumMapPage from "./pages/CurriculumMapPage";
import AboutPage from "./pages/AboutPage";
import RoadmapPage from "./pages/RoadmapPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <BrowserRouter>
      <nav className="bg-blue-700 dark:bg-gray-900 text-white px-6 py-3 flex gap-6 items-center">
        <NavLink to="/home" className={({ isActive }) => isActive ? "font-bold underline" : "hover:underline"}>Home</NavLink>
        <NavLink to="/courses" className={({ isActive }) => isActive ? "font-bold underline" : "hover:underline"}>Courses</NavLink>
        <NavLink to="/map" className={({ isActive }) => isActive ? "font-bold underline" : "hover:underline"}>Map</NavLink>
        <NavLink to="/roadmap" className={({ isActive }) => isActive ? "font-bold underline" : "hover:underline"}>Roadmap</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? "font-bold underline" : "hover:underline"}>About</NavLink>

        {/* Toggle lives in the navbar — works on ALL pages */}
        <button
          onClick={() => setDark(d => !d)}
          className="ml-auto px-3 py-1 rounded-md bg-blue-500 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-gray-600 text-white text-sm font-medium transition-colors"
        >
          {dark ? "☀ Light" : "☾ Dark"}
        </button>
      </nav>

      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/courses" element={<ProtectedRoute><CourseListPage /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><CurriculumMapPage /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);