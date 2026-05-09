import { useState, useEffect } from "react";

const members = [
  {
    name: "Marlan Alfonso",
    role: "Scrum Master",
    sub: "Knowledge Management Analyst",
    img: "/src/assets/marlan.png",
    color: "#1d4ed8",
    glow: "#3b82f6",
    initials: "MA",
  },
  {
    name: "Janice Hernandez",
    role: "Full Stack",
    sub: "Developer",
    img: "/src/assets/janice.png",
    color: "#0f766e",
    glow: "#14b8a6",
    initials: "JH",
  },
  {
    name: "Angela Militar",
    role: "UI/UX",
    sub: "Designer",
    img: "/src/assets/angela.png",
    color: "#7c3aed",
    glow: "#a855f7",
    initials: "AM",
  },
  {
    name: "Angel Florendo",
    role: "QA & Documentation",
    sub: "Lead",
    img: "/src/assets/angel.png",
    color: "#b45309",
    glow: "#f59e0b",
    initials: "AF",
  },
];

export default function AboutPage() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-6xl mx-auto">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .about-root * { font-family: 'DM Sans', system-ui, sans-serif; }

        .fade-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .fade-up.in { opacity: 1; transform: translateY(0); }
        .d1 { transition-delay: 0.05s; }
        .d2 { transition-delay: 0.13s; }
        .d3 { transition-delay: 0.21s; }
        .d4 { transition-delay: 0.29s; }
        .d5 { transition-delay: 0.37s; }
        .d6 { transition-delay: 0.45s; }
        .d7 { transition-delay: 0.53s; }

        .member-card {
          position: relative;
          border-radius: 20px;
          padding: 0 20px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: default;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
          flex: 1;
          min-width: 0;
        }
        .member-card:hover {
          transform: translateY(-10px) scale(1.03);
        }

        .member-img-wrap {
          width: 160px;
          height: 180px;
          margin-top: -60px;
          margin-bottom: 14px;
          position: relative;
          flex-shrink: 0;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.35));
          transition: filter 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .member-card:hover .member-img-wrap {
          filter: drop-shadow(0 16px 36px rgba(0,0,0,0.45));
          transform: translateY(-6px) scale(1.04);
        }
        .member-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: bottom;
        }

        .member-initials {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(255,255,255,0.2);
        }

        .role-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.9);
          margin-bottom: 6px;
        }

        .member-name {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          text-align: center;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .member-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.65);
          text-align: center;
        }

        .tech-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          font-size: 12px;
          color: #374151;
          background: #fff;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .tech-pill:hover {
          border-color: #93c5fd;
          background: #eff6ff;
          transform: translateY(-1px);
        }

        .github-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 10px;
          background: #111827;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          font-family: inherit;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .github-btn:hover {
          background: #1f2937;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.18);
        }

        .section-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent);
          margin: 1.75rem 0;
        }

        .cards-grid {
          display: flex;
          gap: 20px;
          align-items: flex-end;
          margin-top: 64px;
          margin-bottom: 32px;
        }

        @media (max-width: 640px) {
          .cards-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 52px 12px;
            margin-top: 52px;
          }
          .member-card {
            padding: 0 10px 16px !important;
          }
          .member-img-wrap {
            width: 100px !important;
            height: 116px !important;
            margin-top: -46px !important;
          }
          .member-initials {
            font-size: 1.8rem !important;
          }
          .member-name {
            font-size: 13px !important;
          }
          .member-sub {
            font-size: 10px !important;
          }
          .role-badge {
            font-size: 9px !important;
            padding: 2px 7px !important;
          }
        }
      `}</style>

      <div className="about-root">

        {/* Header — title left, GitHub button right */}
        <div className={`fade-up d1 ${visible ? "in" : ""} flex items-start justify-between gap-4 flex-wrap mb-2`}>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-1">About this project</p>
            <h1 className="text-2xl font-bold text-gray-800">Syllabus &amp; Curriculum Map</h1>
          </div>
          <a
            href="https://github.com/MarlanAlfonso/Syllabus-Curriculum-Map"
            target="_blank"
            rel="noopener noreferrer"
            className="github-btn"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87
                2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
                0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12
                0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09
                2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08
                2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65
                3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01
                2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Project description */}
        <div className={`fade-up d2 ${visible ? "in" : ""} mb-5`}>
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
            A Knowledge Mapping web application that visualizes how courses connect across a program —
            showing prerequisites, skills learned, and knowledge flow from foundational to advanced courses.
            Built for <span className="text-gray-700 font-medium">Professional Elective 2</span> at New Era University,
            College of Computer Studies, AY&nbsp;2025–2026.
          </p>
        </div>

        {/* Tech stack pills */}
        <div className={`fade-up d3 ${visible ? "in" : ""} flex flex-wrap gap-2`}>
          {[
            { label: "React 18", icon: "⚛" },
            { label: "Firebase Firestore", icon: "🔥" },
            { label: "React Flow", icon: "🗺" },
            { label: "Tailwind CSS", icon: "🎨" },
            { label: "Vite", icon: "⚡" },
            { label: "Firebase Hosting", icon: "☁" },
          ].map(({ label, icon }) => (
            <span key={label} className="tech-pill">
              <span style={{ fontSize: 13 }}>{icon}</span> {label}
            </span>
          ))}
        </div>

        <div className="section-rule" />

        {/* Team header */}
        <div className={`fade-up d4 ${visible ? "in" : ""}`}>
          <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-1">The Team</p>
          <h2 className="text-lg font-semibold text-gray-700">Meet the developers</h2>
        </div>

        {/* Cards — flex row on desktop, 2×2 grid on mobile */}
        <div className="cards-grid">
          {members.map((m, i) => (
            <div
              key={m.name}
              className={`member-card fade-up d${i + 4} ${visible ? "in" : ""}`}
              style={{
                background: `linear-gradient(160deg, ${m.color} 0%, ${m.glow}cc 100%)`,
                boxShadow: hovered === i
                  ? `0 20px 48px ${m.glow}55`
                  : `0 8px 24px ${m.glow}33`,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="member-img-wrap">
                <img
                  src={m.img}
                  alt={m.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="member-initials" style={{ display: "none" }}>
                  {m.initials}
                </div>
              </div>

              <span className="role-badge">{m.role}</span>
              <p className="member-name">{m.name}</p>
              <p className="member-sub">{m.sub}</p>

              <div style={{
                position: "absolute",
                bottom: -30,
                right: -30,
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                pointerEvents: "none",
              }} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}