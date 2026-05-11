// Author: Angela Militar | feat/roadmap-page
// src/pages/RoadmapPage.jsx
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCourses } from "../services/courseService.js";
import "../styles/RoadmapPage.css";

const SEM_ORDER  = { "1": 0, "2": 1, Summer: 2 };
const UNIT_LIMIT = 24;
const SEM_LABELS  = { "1": "1st Semester", "2": "2nd Semester", Summer: "Summer" };
const YEAR_LABELS = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };

const PIN_COLORS = [
  "#e05252","#e07b30","#c8a800","#4caf72",
  "#3a9ad4","#8b6fd4","#d45a8b","#30b8b0",
];

// ── Map geometry ───────────────────────────────────────────────────────────────
function buildStopPositions(count) {
  const positions = [];
  const ROW_H = 200;
  const LEFT_X = 170, RIGHT_X = 730;
  const START_Y = 130;
  for (let i = 0; i < count; i++) {
    const row   = Math.floor(i / 2);
    const left  = i % 2 === 0;
    positions.push({ x: left ? LEFT_X : RIGHT_X, y: START_Y + row * ROW_H });
  }
  return positions;
}

function buildRoadPath(positions) {
  if (positions.length < 1) return "";
  let d = `M ${positions[0].x} ${positions[0].y}`;
  for (let i = 1; i < positions.length; i++) {
    const p = positions[i - 1], c = positions[i];
    const midY = (p.y + c.y) / 2;
    d += ` C ${p.x} ${midY}, ${c.x} ${midY}, ${c.x} ${c.y}`;
  }
  return d;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function groupBySemester(courses) {
  const groups = {};
  courses.forEach(c => {
    const key = `${c.yearLevel}__${c.semester}`;
    if (!groups[key]) groups[key] = { yearLevel: Number(c.yearLevel), semester: String(c.semester), courses: [] };
    groups[key].courses.push(c);
  });
  return Object.values(groups).sort((a, b) => {
    if (a.yearLevel !== b.yearLevel) return a.yearLevel - b.yearLevel;
    return (SEM_ORDER[a.semester] ?? 9) - (SEM_ORDER[b.semester] ?? 9);
  });
}

// ── SVG Scenery ────────────────────────────────────────────────────────────────
function Tree({ x, y, dark = false, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx="0" cy="-20" rx="15" ry="20" fill={dark ? "#2d7a3a" : "#4caf72"} />
      <ellipse cx="0" cy="-30" rx="11" ry="14" fill={dark ? "#3d8c4a" : "#5dc87a"} />
      <rect x="-3.5" y="0" width="7" height="14" rx="2" fill="#8B6914" />
    </g>
  );
}
function Cloud({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`} opacity="0.8">
      <ellipse cx="0" cy="0" rx="24" ry="14" fill="white" />
      <ellipse cx="-16" cy="5" rx="16" ry="11" fill="white" />
      <ellipse cx="16" cy="5" rx="16" ry="11" fill="white" />
    </g>
  );
}
function Mountain({ x, y, w = 70, h = 65 }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <polygon points={`0,${-h} ${w/2},0 ${-w/2},0`} fill="#8fa8bc" />
      <polygon points={`0,${-h} ${w*0.2},${-h*0.55} ${-w*0.2},${-h*0.55}`} fill="#d8eaf5" />
    </g>
  );
}

// ── Map Pin SVG element ────────────────────────────────────────────────────────
function MapPin({ x, y, color, num, isCurrent, isSelected, isPast, isLocked, onClick, label }) {
  const scale   = isCurrent ? 1.3 : isSelected ? 1.15 : 1.0;
  const opacity = isLocked ? 0.38 : 1;

  return (
    <g
      transform={`translate(${x},${y}) scale(${scale})`}
      style={{ cursor: isLocked ? "not-allowed" : "pointer", opacity, transformOrigin: `${x}px ${y}px` }}
      onClick={isLocked ? undefined : onClick}
    >
      {/* Drop shadow rect (cheap) */}
      <ellipse cx="1" cy="20" rx="16" ry="6" fill="#00000022" />

      {/* Pin body */}
      <path
        d="M0,-50 C-18,-50 -26,-35 -26,-22 C-26,2 0,20 0,20 C0,20 26,2 26,-22 C26,-35 18,-50 0,-50 Z"
        fill={color}
      />

      {/* Inner circle */}
      <circle cx="0" cy="-24" r="13" fill="white" opacity="0.92" />

      {/* Content in circle */}
      {isPast && !isCurrent && (
        <path d="M-7,-27 L-2,-22 L7,-30" stroke="#22c55e" strokeWidth="2.8" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
      )}
      {isLocked && (
        <>
          <rect x="-5" y="-28" width="10" height="8" rx="2" fill="none" stroke="#888" strokeWidth="1.8" />
          <rect x="-6" y="-22" width="12" height="9" rx="2" fill="#aaa" />
        </>
      )}
      {(isCurrent || (!isPast && !isLocked)) && (
        <text x="0" y="-19" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}
          style={{ fontFamily: "'DM Sans', sans-serif" }}>{num}</text>
      )}

      {/* Pin tail */}
      <polygon points="-5,18 5,18 0,30" fill={color} />

      {/* Pulse ring for current */}
      {isCurrent && (
        <circle cx="0" cy="-24" r="32" fill="none" stroke={color} strokeWidth="2.5">
          <animate attributeName="r" values="28;42;28" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2.2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Label beneath */}
      <text x="0" y="46" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#2c3e50"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </text>
    </g>
  );
}

// ── Course Card ────────────────────────────────────────────────────────────────
function CourseCard({ course, status, semKey, onEnroll, onPass, onFail, enrolledUnits, isCurrentSem }) {
  const units        = Number(course.units || 3);
  const semUnits     = enrolledUnits[semKey] || 0;
  const wouldExceed  = semUnits + units > UNIT_LIMIT && status === "not_enrolled";
  const prereqs      = course.prerequisites || [];

  const SC = {
    not_enrolled: { bg:"#f9fafb", bdr:"#e5e7eb", pill:"#e5e7eb", pillText:"#6b7280", label:"Not enrolled" },
    enrolled:     { bg:"#eff6ff", bdr:"#93c5fd", pill:"#dbeafe", pillText:"#1d4ed8", label:"Enrolled"      },
    passed:       { bg:"#f0fdf4", bdr:"#86efac", pill:"#dcfce7", pillText:"#15803d", label:"Passed"        },
    failed:       { bg:"#fff1f1", bdr:"#fca5a5", pill:"#fee2e2", pillText:"#b91c1c", label:"Failed"        },
    retake:       { bg:"#fffbeb", bdr:"#fcd34d", pill:"#fef3c7", pillText:"#b45309", label:"Retake"        },
  };
  const s = SC[status] || SC.not_enrolled;

  return (
    <motion.div layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
      style={{ background:s.bg, border:`1.5px solid ${s.bdr}`, borderRadius:10, padding:"10px 13px", marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:3 }}>
        <span style={{ fontSize:11, fontWeight:700, color:"#374151", letterSpacing:"0.05em", fontFamily:"'DM Sans',sans-serif" }}>
          {course.courseCode}
        </span>
        <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:999, background:s.pill, color:s.pillText }}>
          {s.label}
        </span>
      </div>
      <div style={{ fontSize:13, fontWeight:500, color:"#111827", lineHeight:1.35, marginBottom:4 }}>{course.courseTitle}</div>
      <div style={{ fontSize:11, color:"#9ca3af", display:"flex", gap:10 }}>
        <span>{units} units</span>
        {prereqs.length > 0 && (
          <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:190 }}>
            Prereqs: {prereqs.join(", ")}
          </span>
        )}
      </div>
      {isCurrentSem && (
        <div style={{ display:"flex", gap:6, marginTop:8, paddingTop:8, borderTop:"1px solid #f3f4f6" }}>
          {(status === "not_enrolled" || status === "retake") && (
            <button className="rm-btn rm-btn-enroll" disabled={wouldExceed}
              onClick={() => onEnroll(course, semKey)}>
              {status === "retake" ? "Re-enroll" : "Enroll"}
            </button>
          )}
          {status === "enrolled" && (
            <>
              <button className="rm-btn rm-btn-pass" onClick={() => onPass(course, semKey)}>✓ Passed</button>
              <button className="rm-btn rm-btn-fail" onClick={() => onFail(course, semKey)}>✕ Failed</button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Semester Side Panel ────────────────────────────────────────────────────────
function SemesterPanel({ group, semKey, color, isCurrentSem, courseStatus, enrolledUnits,
  onEnroll, onPass, onFail, onAdvance, canAdvance, isLast, onClose }) {
  const totalUnits   = enrolledUnits[semKey] || 0;
  const passedCount  = group.courses.filter(c => courseStatus[c.courseCode] === "passed").length;
  const enrolledCnt  = group.courses.filter(c => courseStatus[c.courseCode] === "enrolled").length;

  return (
    <motion.div className="rm-panel"
      initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:50 }}
      transition={{ type:"spring", stiffness:280, damping:28 }}>
      {/* Header */}
      <div className="rm-panel-hdr" style={{ background:color }}>
        <div>
          <div className="rm-panel-yr">{YEAR_LABELS[group.yearLevel] || `Year ${group.yearLevel}`}</div>
          <div className="rm-panel-sem">{SEM_LABELS[group.semester] || group.semester}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div className="rm-unit-badge">
            <span style={{ fontWeight:700 }}>{totalUnits}</span>
            <span style={{ opacity:0.65 }}>/{UNIT_LIMIT}</span>
            <span style={{ fontSize:10, opacity:0.55, marginLeft:2 }}>units</span>
          </div>
          <button className="rm-close" onClick={onClose}>✕</button>
        </div>
      </div>

      {/* Stats */}
      <div className="rm-stats">
        {[
          { n: group.courses.length, l:"Courses",  c:"#374151" },
          { n: passedCount,          l:"Passed",   c:"#15803d" },
          { n: enrolledCnt,          l:"Enrolled", c:"#1d4ed8" },
          { n: `${totalUnits}/${UNIT_LIMIT}`, l:"Units", c: totalUnits >= UNIT_LIMIT ? "#b91c1c" : "#374151" },
        ].map(s => (
          <div key={s.l} className="rm-stat">
            <span className="rm-stat-n" style={{ color:s.c }}>{s.n}</span>
            <span className="rm-stat-l">{s.l}</span>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div className="rm-courses">
        <AnimatePresence mode="popLayout">
          {group.courses.map(c => (
            <CourseCard key={c.courseCode} course={c}
              status={courseStatus[c.courseCode] || "not_enrolled"}
              semKey={semKey} onEnroll={onEnroll} onPass={onPass} onFail={onFail}
              enrolledUnits={enrolledUnits} isCurrentSem={isCurrentSem} />
          ))}
        </AnimatePresence>
      </div>

      {/* Advance button */}
      {isCurrentSem && canAdvance && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="rm-advance-row">
          <button className="rm-advance" style={{ background:color }} onClick={onAdvance}>
            {isLast ? "🎓 Graduation Check" : "Next Semester →"}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Graduation ─────────────────────────────────────────────────────────────────
function GraduationBanner({ onReset }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", display:"flex",
      alignItems:"center", justifyContent:"center", zIndex:999 }}>
      <motion.div className="rm-grad-card"
        initial={{ scale:0.5, opacity:0 }} animate={{ scale:1, opacity:1 }}
        transition={{ type:"spring", stiffness:200, damping:18 }}>
        <div className="rm-grad-cap">🎓</div>
        <div className="rm-grad-title">Congratulations!</div>
        <div className="rm-grad-sub">You have graduated!</div>
        <p className="rm-grad-msg">All courses passed. Your academic journey is complete!</p>
        <button className="rm-reset-btn" onClick={onReset}>Start Over</button>
        <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div key={i} style={{
              position:"absolute", bottom:24, left:`${10 + (i % 14) * 6}%`,
              width:8, height:8, borderRadius: i%3===0 ? "50%" : 2,
              background:`hsl(${(i*43)%360},75%,55%)`
            }}
              animate={{ y:[0,-(120+(i%5)*60)], opacity:[1,1,0], rotate:[0,(i%2?1:-1)*540] }}
              transition={{ duration:1.8+(i%4)*0.35, delay:(i%8)*0.09, repeat:Infinity, repeatDelay:i%3 }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const [courses, setCourses]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [semesters, setSemesters]         = useState([]);
  const [currentSemIdx, setCurrentSemIdx] = useState(0);
  const [courseStatus, setCourseStatus]   = useState({});
  const [enrolledUnits, setEnrolledUnits] = useState({});
  const [graduated, setGraduated]         = useState(false);
  const [selectedStop, setSelectedStop]   = useState(0);
  const [unitFlash, setUnitFlash]         = useState(false);

  useEffect(() => {
    getCourses()
      .then(data => {
        setCourses(data);
        const grouped = groupBySemester(data);
        setSemesters(grouped);
        const init = {};
        data.forEach(c => { init[c.courseCode] = "not_enrolled"; });
        setCourseStatus(init);
        setSelectedStop(0);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleEnroll(course, semKey) {
    const prereqs = course.prerequisites || [];
    if (!prereqs.every(p => courseStatus[p] === "passed")) return;
    const units = Number(course.units || 3);
    const cur   = enrolledUnits[semKey] || 0;
    if (cur + units > UNIT_LIMIT) {
      setUnitFlash(true); setTimeout(() => setUnitFlash(false), 1000); return;
    }
    setCourseStatus(p => ({ ...p, [course.courseCode]:"enrolled" }));
    setEnrolledUnits(p => ({ ...p, [semKey]:(p[semKey]||0)+units }));
  }

  function handlePass(course) {
    setCourseStatus(p => ({ ...p, [course.courseCode]:"passed" }));
  }

  function handleFail(course, semKey) {
    const units = Number(course.units || 3);
    setCourseStatus(p => ({ ...p, [course.courseCode]:"failed" }));
    setEnrolledUnits(p => ({ ...p, [semKey]:Math.max(0,(p[semKey]||0)-units) }));
  }

  function canAdvanceNow() {
    const g = semesters[currentSemIdx];
    return g && g.courses.some(c => ["passed","failed"].includes(courseStatus[c.courseCode]));
  }

  function handleAdvance() {
    const g = semesters[currentSemIdx];
    if (!g) return;
    g.courses.filter(c => courseStatus[c.courseCode]==="failed")
      .forEach(c => setCourseStatus(p => ({ ...p, [c.courseCode]:"retake" })));
    const next = currentSemIdx + 1;
    if (next >= semesters.length) {
      setGraduated(true); return;
    }
    setCurrentSemIdx(next);
    setSelectedStop(next);
  }

  function handleReset() {
    setGraduated(false); setCurrentSemIdx(0); setSelectedStop(0);
    const init = {};
    courses.forEach(c => { init[c.courseCode]="not_enrolled"; });
    setCourseStatus(init); setEnrolledUnits({});
  }

  if (loading) return (
    <div className="rm-loading">
      <motion.div animate={{ y:[0,-14,0] }} transition={{ repeat:Infinity, duration:1.1 }} style={{ fontSize:40 }}>🎓</motion.div>
      <p>Loading your roadmap…</p>
    </div>
  );
  if (error) return <div className="rm-loading"><p>Error: {error}</p></div>;

  const stopPositions = buildStopPositions(semesters.length);
  const roadPath      = buildRoadPath(stopPositions);
  const canvasH       = stopPositions.length > 0
    ? stopPositions[stopPositions.length - 1].y + 160
    : 420;

  const totalCourses = courses.length;
  const passedCount  = courses.filter(c => courseStatus[c.courseCode]==="passed").length;
  const pct          = totalCourses > 0 ? Math.round((passedCount/totalCourses)*100) : 0;

  const selGroup = selectedStop !== null ? semesters[selectedStop] : null;
  const selKey   = selGroup ? `${selGroup.yearLevel}__${selGroup.semester}` : null;

  // Scatter trees at safe positions (avoid road center ~450)
  const leftTrees  = [[50,100],[70,300],[45,500],[65,700],[55,900]];
  const rightTrees = [[850,150],[830,350],[860,550],[845,750],[855,950]];
  const midClouds  = [[200,40],[500,28],[760,50],[360,22]];

  return (
    <div className="rm-page">
      {/* Header */}
      <div className="rm-header">
        <div>
          <div className="rm-h-title">Academic Roadmap</div>
          <div className="rm-h-sub">Click a stop to open that semester — enroll, pass, and advance</div>
        </div>
        <div className="rm-prog-wrap">
          <div className="rm-prog-label">
            <span>{passedCount}/{totalCourses} courses passed</span>
            <span>{pct}%</span>
          </div>
          <div className="rm-prog-track">
            <motion.div className="rm-prog-fill" animate={{ width:`${pct}%` }} transition={{ duration:0.5 }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="rm-body">
        {/* Road map */}
        <div className="rm-map-outer">
          <AnimatePresence>
            {unitFlash && (
              <motion.div key="flash" className="rm-flash"
                initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                Unit limit reached (max {UNIT_LIMIT} units)
              </motion.div>
            )}
          </AnimatePresence>

          <svg width="100%" viewBox={`0 0 900 ${canvasH}`} style={{ display:"block" }}>
            {/* Grass background */}
            <rect x="0" y="0" width="900" height={canvasH} fill="#b8d96e" rx="14" />
            <rect x="0" y="0" width="900" height={canvasH} fill="#c8e07a" rx="14" opacity="0.5" />

            {/* Scenery */}
            {leftTrees.filter(([,y]) => y < canvasH + 50).map(([x,y],i) => <Tree key={`lt${i}`} x={x} y={y} dark={i%2===0} s={0.9+i*0.06} />)}
            {rightTrees.filter(([,y]) => y < canvasH + 50).map(([x,y],i) => <Tree key={`rt${i}`} x={x} y={y} dark={i%2===1} s={0.85+i*0.06} />)}
            {midClouds.map(([x,y],i) => <Cloud key={`cl${i}`} x={x} y={y} />)}
            {canvasH > 250 && <Mountain x={890} y={180} w={80} h={70} />}
            {canvasH > 450 && <Mountain x={20}  y={380} w={65} h={55} />}
            {canvasH > 650 && <Mountain x={885} y={600} w={75} h={60} />}

            {/* Road — wide dark path */}
            <path d={roadPath} fill="none" stroke="#333" strokeWidth="62" strokeLinecap="round" strokeLinejoin="round" />
            {/* Road kerbs */}
            <path d={roadPath} fill="none" stroke="#555" strokeWidth="65" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
            {/* Center lane markings */}
            <path d={roadPath} fill="none" stroke="#f5d76e" strokeWidth="3" strokeLinecap="round" strokeDasharray="20 18" />
            {/* Edge white lines */}
            <path d={roadPath} fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.15" />

            {/* Green progress overlay on road */}
            {currentSemIdx > 0 && (() => {
              const subPath = buildRoadPath(stopPositions.slice(0, currentSemIdx + 1));
              return <path d={subPath} fill="none" stroke="#22c55e" strokeWidth="8"
                strokeLinecap="round" strokeDasharray="14 12" opacity="0.75" />;
            })()}

            {/* Pins */}
            {semesters.map((group, idx) => {
              const pos      = stopPositions[idx];
              const color    = PIN_COLORS[idx % PIN_COLORS.length];
              const isCurr   = idx === currentSemIdx;
              const isPast   = idx < currentSemIdx;
              const isLocked = idx > currentSemIdx;
              const isSel    = idx === selectedStop;
              const semLabel = `Y${group.yearLevel}·${group.semester === "Summer" ? "Sum" : group.semester+"S"}`;
              return (
                <MapPin key={idx} x={pos.x} y={pos.y} color={color}
                  num={idx+1} isCurrent={isCurr} isSelected={isSel}
                  isPast={isPast} isLocked={isLocked}
                  label={semLabel}
                  onClick={() => setSelectedStop(idx)} />
              );
            })}

            {/* "You are here" avatar on current stop */}
            {stopPositions[currentSemIdx] && (() => {
              const { x, y } = stopPositions[currentSemIdx];
              const side = currentSemIdx % 2 === 0 ? 42 : -42;
              return (
                <g transform={`translate(${x + side},${y - 58})`}>
                  <circle cx="0" cy="0" r="15" fill="white" stroke="#f59e0b" strokeWidth="2.5" />
                  <text x="0" y="5" textAnchor="middle" fontSize="15">🎓</text>
                  <text x="0" y="-20" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#7c5c1e"
                    style={{ fontFamily:"sans-serif" }}>You</text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Side panel */}
        <AnimatePresence mode="wait">
          {selGroup && (
            <SemesterPanel key={selectedStop}
              group={selGroup} semKey={selKey}
              color={PIN_COLORS[selectedStop % PIN_COLORS.length]}
              isCurrentSem={selectedStop === currentSemIdx}
              courseStatus={courseStatus} enrolledUnits={enrolledUnits}
              onEnroll={handleEnroll} onPass={handlePass} onFail={handleFail}
              onAdvance={handleAdvance} canAdvance={canAdvanceNow()}
              isLast={currentSemIdx === semesters.length - 1}
              onClose={() => setSelectedStop(null)} />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {graduated && <GraduationBanner onReset={handleReset} />}
      </AnimatePresence>
    </div>
  );
}
