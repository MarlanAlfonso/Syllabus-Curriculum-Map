import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navLinks = [
    { to: "/home", label: "Home" },
    { to: "/courses", label: "Courses" },
    { to: "/map", label: "Curriculum Map" },
    { to: "/about", label: "About" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-800 text-white px-6 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-10 shadow">
        <span className="font-bold text-lg tracking-wide">SCM — Knowledge Map</span>
        <div className="flex gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "font-bold underline text-white" : "text-blue-200 hover:text-white"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <button
          className="text-sm text-blue-200 hover:text-white md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰ Menu
        </button>
      </nav>

      {/* Body: Sidebar + Main */}
      <div className="flex flex-1 pt-12">
        {/* Sidebar */}
        <aside
          className={`bg-gray-100 border-r border-gray-200 w-60 min-h-screen p-4 flex-shrink-0 transition-all ${
            sidebarOpen ? "block" : "hidden"
          } md:block`}
        >
          <p className="text-xs uppercase text-gray-400 font-semibold mb-3">Navigation</p>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded text-sm ${
                      isActive ? "bg-blue-100 text-blue-800 font-semibold" : "text-gray-600 hover:bg-gray-200"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {/* Placeholder for future filter controls */}
          <div className="mt-8 text-xs text-gray-400">Filter controls (Sprint 3)</div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}