// src/components/layout/AppShell.jsx

import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "../../context/useAuth.js";

// ── Dark Mode Context ──────────────────────────────────────────────────────
export const DarkModeContext = createContext({ dark: false, toggle: () => {} });
export const useDarkMode = () => useContext(DarkModeContext);

// ── Nav icons ─────────────────────────────────────────────────────────────
const NAV_ICONS = {
  "/home": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 6.5L8 2l6 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.5Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M6 15v-5h4v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  "/courses": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  "/map": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="3.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="12.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="12.5" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5.5 8h3l2.5-4M5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  "/roadmap": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12l3.5-4 3 3L12 5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 5h4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  "/about": (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 7v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="8" cy="5" r="0.8" fill="currentColor"/>
    </svg>
  ),
};

export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("scm-dark");
    if (saved === null) return false;
    return saved === "true";
  });

  const location = useLocation();
  const { user, role, logout } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setMenuOpen(false), 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("scm-dark", dark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const navLinks = [
    { to: "/home",    label: "Dashboard" },
    { to: "/courses", label: "Courses" },
    { to: "/map",     label: "Curriculum Map" },
    { to: "/roadmap", label: "Roadmap" },
    { to: "/about",   label: "About" },
  ];

  const isAdmin = role === "admin";

  return (
    <DarkModeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {/* CHANGED: added overflow-x-hidden to the outermost wrapper */}
      <div className={`min-h-screen flex overflow-x-hidden ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
          * { font-family: 'DM Sans', system-ui, sans-serif; }

          /* CHANGED: prevent html/body from ever growing a horizontal scrollbar */
          html, body, #root {
            overflow-x: hidden;
            max-width: 100vw;
          }

          .sidebar {
            background: ${dark ? "#0f172a" : "#ffffff"};
            border-right: 1px solid ${dark ? "#1e293b" : "#e5e7eb"};
            transition: background 0.25s ease, border-color 0.25s ease;
          }

          .sidebar-link {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 13.5px;
            color: ${dark ? "#94a3b8" : "#4b5563"};
            text-decoration: none;
            transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
          }
          .sidebar-link:hover {
            background: ${dark ? "#1e3a8a22" : "#e5edff"};
            color: ${dark ? "#93c5fd" : "#1e40af"};
            transform: translateX(3px);
          }
          .sidebar-link.active {
            background: ${dark ? "#1e3a8a44" : "#dbeafe"};
            color: ${dark ? "#60a5fa" : "#1d4ed8"};
            font-weight: 600;
          }

          .nav-section-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: ${dark ? "#475569" : "#9ca3af"};
            font-weight: 700;
            margin-bottom: 6px;
            margin-top: 4px;
            padding: 0 12px;
          }

          .sidebar-brand {
            border-bottom: 1px solid ${dark ? "#1e293b" : "#f3f4f6"};
          }
          .brand-title { color: ${dark ? "#f1f5f9" : "#111827"}; }
          .brand-sub   { color: ${dark ? "#475569" : "#9ca3af"}; }

          .dark-toggle-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid ${dark ? "#1e293b" : "#e5e7eb"};
            background: ${dark ? "#1e293b" : "#f9fafb"};
            color: ${dark ? "#94a3b8" : "#6b7280"};
            font-size: 12.5px;
            font-weight: 500;
            font-family: inherit;
            cursor: pointer;
            transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
            text-align: left;
          }
          .dark-toggle-btn:hover {
            background: ${dark ? "#0f2a4a" : "#e5edff"};
            color: ${dark ? "#60a5fa" : "#1e40af"};
            border-color: ${dark ? "#1e3a8a" : "#bfdbfe"};
          }
          .toggle-track {
            position: relative;
            width: 28px;
            height: 16px;
            border-radius: 999px;
            background: ${dark ? "#2563eb" : "#d1d5db"};
            transition: background 0.25s ease;
            flex-shrink: 0;
            margin-left: auto;
          }
          .toggle-knob {
            position: absolute;
            top: 2px;
            left: ${dark ? "14px" : "2px"};
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #fff;
            transition: left 0.25s cubic-bezier(0.34,1.56,0.64,1);
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }

          .sidebar-footer {
            border-top: 1px solid ${dark ? "#1e293b" : "#f3f4f6"};
          }
          .user-name  { color: ${dark ? "#f1f5f9" : "#111827"}; }
          .role-badge-admin {
            display: inline-flex; align-items: center;
            padding: 2px 8px; border-radius: 999px;
            font-size: 10px; font-weight: 700; letter-spacing: .04em;
            background: ${dark ? "#1e3a8a" : "#dbeafe"};
            color: ${dark ? "#93c5fd" : "#1d4ed8"};
          }
          .role-badge-user {
            display: inline-flex; align-items: center;
            padding: 2px 8px; border-radius: 999px;
            font-size: 10px; font-weight: 700; letter-spacing: .04em;
            background: ${dark ? "#1e293b" : "#f3f4f6"};
            color: ${dark ? "#64748b" : "#6b7280"};
          }
          .logout-btn {
            display: flex; align-items: center; gap: 6px;
            width: 100%; padding: 7px 12px;
            border-radius: 8px; border: none;
            background: transparent; color: #ef4444;
            font-size: 13px; font-weight: 500;
            font-family: inherit; cursor: pointer;
            transition: background 0.15s ease;
            text-align: left;
          }
          .logout-btn:hover {
            background: ${dark ? "#3f0f0f" : "#fef2f2"};
          }

          .mobile-menu {
            overflow: hidden;
            max-height: 0;
            transition: max-height 0.35s ease, opacity 0.3s ease;
            opacity: 0;
          }
          .mobile-menu.open { max-height: 400px; opacity: 1; }

          .page-enter {
            animation: pageIn 0.35s ease both;
          }
          @keyframes pageIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .sidebar-enter {
            animation: sideIn 0.4s ease both;
          }
          @keyframes sideIn {
            from { opacity: 0; transform: translateX(-12px); }
            to   { opacity: 1; transform: translateX(0); }
          }

          .main-content {
            background: ${dark ? "#0f172a" : "#f9fafb"};
            transition: background 0.25s ease;
          }
        `}</style>

        {/* ── Sidebar — desktop only ─────────────────────────────────── */}
        <aside className="sidebar hidden md:flex flex-col w-56 min-h-screen flex-shrink-0 sidebar-enter fixed top-0 left-0 bottom-0 z-20">

          <div className="sidebar-brand px-5 py-4">
            <p className="brand-title font-bold text-sm tracking-wide">SCM</p>
            <p className="brand-sub text-[11px] mt-0.5">Knowledge Map</p>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            <p className="nav-section-label">Navigation</p>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              >
                <span className="flex-shrink-0 opacity-80">
                  {NAV_ICONS[link.to]}
                </span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer p-3 space-y-2">
            <p className="nav-section-label" style={{ marginTop: 0 }}>Appearance</p>
            <button className="dark-toggle-btn" onClick={() => setDark(d => !d)}>
              {dark ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1 1M10.1 10.1l1 1M2.9 11.1l1-1M10.1 3.9l1-1"
                    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.5 8A5.5 5.5 0 0 1 6 2.5a5.5 5.5 0 1 0 5.5 5.5z"
                    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              )}
              {dark ? "Light Mode" : "Dark Mode"}
              <span className="toggle-track">
                <span className="toggle-knob" />
              </span>
            </button>

            <div className="flex items-center gap-3 px-2 py-2">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-100"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold text-sm">
                    {user?.displayName?.[0] ?? "U"}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="user-name text-[13px] font-semibold truncate leading-tight">
                  {user?.displayName ?? "User"}
                </p>
                <div className="mt-1">
                  <span className={isAdmin ? "role-badge-admin" : "role-badge-user"}>
                    {isAdmin ? "Admin" : "User"}
                  </span>
                </div>
              </div>
            </div>

            <button className="logout-btn" onClick={logout}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M10 10l3-3-3-3M13 7H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Mobile top bar ───────────────────────────────────────── */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-blue-800 px-4 py-3 flex items-center justify-between shadow-md">
          <p className="font-bold text-white text-sm tracking-wide">
            SCM <span className="text-blue-300 font-normal">— Knowledge Map</span>
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(d => !d)}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-700 text-blue-200 hover:bg-blue-600 transition"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1 1M10.1 10.1l1 1M2.9 11.1l1-1M10.1 3.9l1-1"
                    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M11.5 8A5.5 5.5 0 0 1 6 2.5a5.5 5.5 0 1 0 5.5 5.5z"
                    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              )}
            </button>

            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-300" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">{user?.displayName?.[0] ?? "U"}</span>
              </div>
            )}

            <button
              className="flex flex-col gap-1.5 p-1"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ──────────────────────────────────────── */}
        <div className={`mobile-menu md:hidden fixed top-[52px] left-0 right-0 z-10 bg-blue-900 border-b border-blue-800 px-5 shadow-lg ${menuOpen ? "open" : ""}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 text-sm border-b border-blue-800/50 ${isActive ? "text-white font-semibold" : "text-blue-200"}`
              }
            >
              <span className="opacity-70">{NAV_ICONS[link.to]}</span>
              {link.label}
            </NavLink>
          ))}

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-white">{user?.displayName ?? "User"}</p>
              <span className={isAdmin ? "role-badge-admin" : "role-badge-user"}>
                {isAdmin ? "Admin" : "User"}
              </span>
            </div>
            <button onClick={logout} className="text-xs text-red-300 font-semibold hover:text-red-200 transition">
              Sign out
            </button>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────── */}
        {/* CHANGED: removed overflow-auto from <main> — it was creating its own
            scroll context and bypassing the overflow-x:hidden on the wrapper.
            overflow-hidden on the wrapper + per-row scroll in CurriculumMapPage
            handles everything correctly now. */}
        <div className="main-content flex-1 md:ml-56 pt-[52px] md:pt-0 min-h-screen overflow-x-hidden">
          <main key={location.pathname} className="flex-1 page-enter">
            {children}
          </main>
        </div>

      </div>
    </DarkModeContext.Provider>
  );
}