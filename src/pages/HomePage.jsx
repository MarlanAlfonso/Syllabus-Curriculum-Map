import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../components/layout/AppShell";

export default function HomePage() {
  const navigate = useNavigate();
  const { dark } = useDarkMode();
  const [stats, setStats] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const q = query(collection(db, "courses"), where("isActive", "==", true));
        const snapshot = await getDocs(q);
        const courses = snapshot.docs.map((d) => d.data());
        const totalPrereqs = courses.reduce((sum, c) => sum + (c.prerequisites?.length || 0), 0);
        const allSkills = new Set(courses.flatMap((c) => c.skillsLearned || []));
        const yearLevels = new Set(courses.map((c) => c.yearLevel));
        setStats({
          courses: courses.length,
          years: yearLevels.size,
          prereqs: totalPrereqs,
          skills: allSkills.size,
        });
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    }
    fetchStats();
  }, []);

  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const statItems = [
    {
      label: "Total Courses",
      value: stats?.courses,
      sub: "Active in curriculum",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
      accent: "#1d4ed8",
      accentBg: dark ? "#1e3a5f" : "#eff6ff",
    },
    {
      label: "Year Levels",
      value: stats?.years,
      sub: "Years 1 through 4",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="4" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 8h16" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
      accent: "#15803d",
      accentBg: dark ? "#14301f" : "#f0fdf4",
    },
    {
      label: "Prerequisites Mapped",
      value: stats?.prereqs,
      sub: "Mapped connections",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="4.5" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="15.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="15.5" cy="15.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 10h4l2.5-5M7 10l5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
      accent: "#b45309",
      accentBg: dark ? "#2d1f07" : "#fffbeb",
    },
    {
      label: "Skill Tags",
      value: stats?.skills,
      sub: "Across all courses",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 6a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l5.414 5.414a2 2 0 0 1 0 2.828l-2.586 2.586a2 2 0 0 1-2.828 0L3.293 10.707A1 1 0 0 1 3 10V6Z" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="6.5" cy="8.5" r="1" fill="currentColor"/>
        </svg>
      ),
      accent: "#7c3aed",
      accentBg: dark ? "#1e1040" : "#f5f3ff",
    },
  ];

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="2" y="3" width="18" height="16" rx="2.5" stroke="#1d4ed8" strokeWidth="1.5"/>
          <path d="M7 8h8M7 11.5h8M7 15h5" stroke="#1d4ed8" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
      bg: dark ? "#1e3a5f" : "#eff6ff",
      borderAccent: "#bfdbfe",
      title: "Browse Courses",
      desc: "View all active courses with their units, year levels, semesters, and prerequisite links.",
      action: () => navigate("/courses"),
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="5" cy="11" r="3" stroke="#15803d" strokeWidth="1.5"/>
          <circle cx="17" cy="5" r="3" stroke="#15803d" strokeWidth="1.5"/>
          <circle cx="17" cy="17" r="3" stroke="#15803d" strokeWidth="1.5"/>
          <path d="M8 11h4l3-5M8 11l6 6" stroke="#15803d" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
      bg: dark ? "#14301f" : "#f0fdf4",
      borderAccent: "#bbf7d0",
      title: "Visualize Prerequisites",
      desc: "See how courses connect as an interactive graph with nodes and directed prerequisite edges.",
      action: () => navigate("/map"),
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="10" cy="10" r="7" stroke="#b45309" strokeWidth="1.5"/>
          <path d="M15.5 15.5l4 4" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M7.5 10h5M10 7.5v5" stroke="#b45309" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
      bg: dark ? "#2d1f07" : "#fffbeb",
      borderAccent: "#fde68a",
      title: "Filter and Explore",
      desc: "Filter by year level, semester, department, or skill tag to focus the curriculum view.",
      action: () => navigate("/map"),
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M4 14l5-5 3.5 3.5L19 5" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 5h3v3" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 19h14" stroke="#7c3aed" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
      bg: dark ? "#1e1040" : "#f5f3ff",
      borderAccent: "#ddd6fe",
      title: "Manage Curriculum",
      desc: "Add, edit, and soft-disable courses while preserving all historical prerequisite links.",
      action: () => navigate("/courses"),
    },
  ];

  const d = dark; // shorthand for inline style conditionals

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <style>{`
        .fade-up {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.05s; }
        .delay-2 { transition-delay: 0.10s; }
        .delay-3 { transition-delay: 0.16s; }
        .delay-4 { transition-delay: 0.22s; }
        .delay-5 { transition-delay: 0.28s; }
        .delay-6 { transition-delay: 0.34s; }
        .delay-7 { transition-delay: 0.40s; }

        /* ── Hero ── */
        .hero-wrap {
          background: linear-gradient(130deg, #1e3a8a 0%, #1d4ed8 55%, #3b82f6 100%);
          border-radius: 16px;
          padding: 40px 44px;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
        }
        .hero-bg-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.07;
          pointer-events: none;
        }
        .hero-top-bar {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          position: relative;
          z-index: 2;
        }
        .uni-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          letter-spacing: 0.06em;
          color: #bfdbfe;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 999px;
          padding: 5px 14px;
        }
        .hero-headline {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          line-height: 1.25;
          margin: 0 0 10px;
          position: relative;
          z-index: 2;
          letter-spacing: -0.3px;
        }
        .hero-sub {
          font-size: 14px;
          color: #93c5fd;
          line-height: 1.7;
          max-width: 480px;
          margin: 0 0 24px;
          position: relative;
          z-index: 2;
        }
        .hero-btns {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          position: relative;
          z-index: 2;
        }
        .btn-primary {
          background: #fff;
          color: #1e3a8a;
          border: none;
          padding: 12px 26px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          font-family: inherit;
          letter-spacing: 0.01em;
        }
        .btn-primary:hover {
          background: #eff6ff;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .btn-secondary {
          background: rgba(255,255,255,0.12);
          color: #fff;
          border: 1.5px solid rgba(255,255,255,0.35);
          padding: 12px 26px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
          font-family: inherit;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.22);
          border-color: rgba(255,255,255,0.6);
          transform: translateY(-2px);
        }

        /* ── Stats ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 6px;
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-wrap { padding: 28px 24px; }
          .hero-headline { font-size: 22px; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 400px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }

        .stat-card {
          background: ${d ? "#1e293b" : "#fff"};
          border: 1px solid ${d ? "#334155" : "#e5e7eb"};
          border-radius: 12px;
          padding: 16px 18px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: ${d ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.08)"};
          border-color: ${d ? "#3b82f6" : "#c7d2fe"};
        }
        .stat-icon-wrap {
          width: 36px; height: 36px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px; flex-shrink: 0;
        }
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: ${d ? "#f1f5f9" : "#111827"};
          line-height: 1;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }
        .stat-label {
          font-size: 12px;
          font-weight: 600;
          color: ${d ? "#cbd5e1" : "#374151"};
          margin-bottom: 2px;
        }
        .stat-sub { font-size: 11px; color: ${d ? "#64748b" : "#9ca3af"}; }
        .stats-footer {
          font-size: 11px;
          color: ${d ? "#475569" : "#9ca3af"};
          text-align: right;
          margin-bottom: 28px;
          padding-right: 2px;
        }

        /* ── Quick Actions ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 8px;
        }
        .feature-card {
          background: ${d ? "#1e293b" : "#fff"};
          border: 1px solid ${d ? "#334155" : "#e5e7eb"};
          border-radius: 14px;
          padding: 22px 18px;
          cursor: pointer;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: var(--card-accent, #e5e7eb);
          border-radius: 0 0 14px 14px;
          opacity: 0;
          transition: opacity 0.22s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: ${d ? "0 12px 32px rgba(0,0,0,0.45)" : "0 12px 32px rgba(0,0,0,0.09)"};
          border-color: var(--card-accent, #e5e7eb);
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon-wrap {
          width: 46px; height: 46px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .feature-title {
          font-size: 13px;
          font-weight: 700;
          color: ${d ? "#f1f5f9" : "#111827"};
          margin-bottom: 8px;
        }
        .feature-desc {
          font-size: 12px;
          color: ${d ? "#94a3b8" : "#6b7280"};
          line-height: 1.65;
        }
        .feature-arrow {
          display: inline-flex; align-items: center;
          margin-top: 12px;
          font-size: 11px; font-weight: 600;
          color: ${d ? "#475569" : "#9ca3af"};
          gap: 3px;
          transition: color 0.2s, gap 0.2s;
        }
        .feature-card:hover .feature-arrow { color: #3b82f6; gap: 6px; }

        /* Loading shimmer */
        .pulse-dot {
          display: inline-block;
          width: 48px; height: 28px;
          background: linear-gradient(90deg, ${d ? "#334155 25%, #475569 50%, #334155 75%" : "#e5e7eb 25%, #d1d5db 50%, #e5e7eb 75%"});
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 6px;
          vertical-align: middle;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Section label */
        .section-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: ${d ? "#475569" : "#9ca3af"};
          font-weight: 700;
          margin-bottom: 12px;
        }
      `}</style>

      {/* ── Hero ── */}
      <div className={`hero-wrap fade-up ${visible ? "visible" : ""}`}>
        <svg className="hero-bg-svg" viewBox="0 0 800 220" fill="none" preserveAspectRatio="xMidYMid slice">
          <circle cx="120" cy="60" r="8" fill="white"/>
          <circle cx="340" cy="40" r="6" fill="white"/>
          <circle cx="580" cy="90" r="9" fill="white"/>
          <circle cx="720" cy="30" r="5" fill="white"/>
          <circle cx="200" cy="170" r="7" fill="white"/>
          <circle cx="460" cy="160" r="6" fill="white"/>
          <circle cx="680" cy="180" r="8" fill="white"/>
          <circle cx="50" cy="150" r="5" fill="white"/>
          <line x1="120" y1="60" x2="340" y2="40" stroke="white" strokeWidth="1.5"/>
          <line x1="340" y1="40" x2="580" y2="90" stroke="white" strokeWidth="1.5"/>
          <line x1="580" y1="90" x2="720" y2="30" stroke="white" strokeWidth="1.5"/>
          <line x1="120" y1="60" x2="200" y2="170" stroke="white" strokeWidth="1.5"/>
          <line x1="200" y1="170" x2="460" y2="160" stroke="white" strokeWidth="1.5"/>
          <line x1="460" y1="160" x2="680" y2="180" stroke="white" strokeWidth="1.5"/>
          <line x1="340" y1="40" x2="460" y2="160" stroke="white" strokeWidth="1"/>
          <line x1="580" y1="90" x2="460" y2="160" stroke="white" strokeWidth="1"/>
          <line x1="50" y1="150" x2="120" y2="60" stroke="white" strokeWidth="1"/>
          <polygon points="338,40 342,36 344,42" fill="white"/>
          <polygon points="578,90 583,88 581,95" fill="white"/>
          <polygon points="458,160 463,156 465,163" fill="white"/>
          <polygon points="678,180 683,176 685,183" fill="white"/>
        </svg>

        <div className="hero-top-bar">
          <span className="uni-tag">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L11 4v4a5 5 0 0 1-5 3 5 5 0 0 1-5-3V4L6 1z" stroke="#93c5fd" strokeWidth="1.2"/>
            </svg>
            New Era University &nbsp;·&nbsp; Professional Elective 2
          </span>
        </div>

        <h1 className="hero-headline">Syllabus Knowledge Map</h1>
        <p className="hero-sub">
          Visualize course connections, prerequisites, skills, and learning progression from Year 1 to Year 4.
        </p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => navigate("/map")}>
            View Curriculum Map →
          </button>
          <button className="btn-secondary" onClick={() => navigate("/courses")}>
            Browse Courses
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <p className={`section-label fade-up delay-1 ${visible ? "visible" : ""}`}>Live Overview</p>
      <div className="stats-grid">
        {statItems.map(({ label, value, sub, icon, accent, accentBg }, i) => (
          <div key={label} className={`stat-card fade-up delay-${i + 2} ${visible ? "visible" : ""}`}>
            <div className="stat-icon-wrap" style={{ background: accentBg, color: accent }}>
              {icon}
            </div>
            <div className="stat-value">
              {value !== undefined ? value : <span className="pulse-dot" />}
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>
      <p className={`stats-footer fade-up delay-2 ${visible ? "visible" : ""}`}>
        Last updated: {lastUpdated}
      </p>

      {/* ── Quick Actions ── */}
      <p className={`section-label fade-up delay-3 ${visible ? "visible" : ""}`}>Quick Actions</p>
      <div className="features-grid">
        {features.map(({ icon, bg, borderAccent, title, desc, action }, i) => (
          <div
            key={title}
            className={`feature-card fade-up delay-${i + 4} ${visible ? "visible" : ""}`}
            style={{ "--card-accent": borderAccent }}
            onClick={action}
          >
            <div className="feature-icon-wrap" style={{ background: bg }}>{icon}</div>
            <div className="feature-title">{title}</div>
            <p className="feature-desc">{desc}</p>
            <span className="feature-arrow">
              Explore
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}