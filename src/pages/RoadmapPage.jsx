// src/pages/RoadmapPage.jsx
import { useEffect, useState } from "react";
import { getCourses } from "../services/courseService";

const YEAR_CONFIG = {
  1: {
    label: "First Year",
    emoji: "🌱",
    headerBg: "bg-blue-600",
    bodyBg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    cardBorder: "border-l-blue-400",
    semLabel: "text-blue-600",
    dot: "bg-blue-600",
    progress: "bg-blue-500",
  },
  2: {
    label: "Second Year",
    emoji: "🌿",
    headerBg: "bg-emerald-600",
    bodyBg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    cardBorder: "border-l-emerald-400",
    semLabel: "text-emerald-600",
    dot: "bg-emerald-600",
    progress: "bg-emerald-500",
  },
  3: {
    label: "Third Year",
    emoji: "🔭",
    headerBg: "bg-violet-600",
    bodyBg: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-800",
    cardBorder: "border-l-violet-400",
    semLabel: "text-violet-600",
    dot: "bg-violet-600",
    progress: "bg-violet-500",
  },
  4: {
    label: "Fourth Year",
    emoji: "🎓",
    headerBg: "bg-amber-500",
    bodyBg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    cardBorder: "border-l-amber-400",
    semLabel: "text-amber-600",
    dot: "bg-amber-500",
    progress: "bg-amber-500",
  },
};

const SEMESTER_LABELS = {
  1: "1st Semester",
  2: "2nd Semester",
  3: "Summer",
};

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function CourseCard({ course, config }) {
  return (
    <div className={`bg-white rounded-xl border-l-4 ${config.cardBorder} shadow-sm hover:shadow-md transition-shadow duration-200 p-4`}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
        {course.courseCode || "—"}
      </p>
      <p className="text-sm font-semibold text-gray-800 leading-snug mb-2">
        {course.courseTitle || course.title || course.courseName || "Untitled Course"}
      </p>
      {(course.knowledgeBuilt || course.description) && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
          {course.knowledgeBuilt || course.description}
        </p>
      )}
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
        {course.units ?? "—"} units
      </span>
    </div>
  );
}

function SemesterBlock({ semester, courses, config }) {
  if (!courses.length) return null;
  return (
    <div className="mb-5">
      <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest ${config.semLabel}`}>
        {SEMESTER_LABELS[semester] || `Semester ${semester}`}
        <span className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-400 font-normal normal-case tracking-normal">
          {courses.length} course{courses.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} config={config} />
        ))}
      </div>
    </div>
  );
}

function YearSection({ year, courses, isLast }) {
  const cfg = YEAR_CONFIG[year] || YEAR_CONFIG[1];
  const semesters = [...new Set(courses.map((c) => c.semester))].sort((a, b) => a - b);
  const totalUnits = courses.reduce((sum, c) => sum + (Number(c.units) || 0), 0);
  const pct = Math.min(100, Math.round((totalUnits / 40) * 100));

  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-6 top-full w-0.5 h-8 bg-gradient-to-b from-gray-300 to-transparent z-10" />
      )}
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-full ${cfg.headerBg} flex items-center justify-center text-xl text-white shadow-md shrink-0`}>
          {cfg.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-gray-800">{cfg.label}</h2>
          <p className="text-xs text-gray-400">{courses.length} courses · {totalUnits} units</p>
          <div className="flex items-center gap-2 mt-1.5 max-w-xs">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${cfg.progress} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-400 shrink-0">{pct}%</span>
          </div>
        </div>
      </div>
      <div className={`${cfg.bodyBg} border ${cfg.border} rounded-2xl p-5 mb-8`}>
        {semesters.map((sem) => (
          <SemesterBlock
            key={sem}
            semester={sem}
            courses={courses.filter((c) => c.semester === sem)}
            config={cfg}
          />
        ))}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCourses()
      .then((data) => {
        const active = data.filter((c) => c.isActive === true);
        const normalized = active.map((c) => ({
          ...c,
          semester: Number(c.semester) || 1,
          yearLevel: Number(c.yearLevel || c.year || 1),
        }));
        setCourses(normalized);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load courses. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const byYear = courses.reduce((acc, c) => {
    const yr = c.yearLevel;
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(c);
    return acc;
  }, {});

  const years = Object.keys(byYear).map(Number).sort();
  const totalUnits = courses.reduce((sum, c) => sum + (Number(c.units) || 0), 0);
  const totalSemesters = [...new Set(courses.map((c) => c.semester))].length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading curriculum roadmap…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <span className="text-4xl">⚠️</span>
        <p className="text-gray-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <span className="text-5xl">🗺️</span>
        <h2 className="text-xl font-bold text-gray-600">No active courses yet</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Once courses are marked active in the curriculum, they'll appear here on the roadmap.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">🗺️</span>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Curriculum Roadmap
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          A complete view of the academic journey — organized by year level and semester
          so students and planners can see every active course at a glance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard icon="📚" label="Active Courses" value={courses.length} />
        <StatCard icon="🏫" label="Year Levels" value={years.length} />
        <StatCard icon="⚡" label="Total Units" value={totalUnits} />
        <StatCard icon="📅" label="Semesters" value={totalSemesters} />
      </div>

      {/* Timeline */}
      <div>
        {years.map((year, i) => (
          <YearSection
            key={year}
            year={year}
            courses={byYear[year]}
            isLast={i === years.length - 1}
          />
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-300 mt-4">
        Showing {courses.length} active course{courses.length !== 1 ? "s" : ""} across{" "}
        {years.length} year level{years.length !== 1 ? "s" : ""}. Only{" "}
        <span className="font-semibold">isActive: true</span> courses are displayed.
      </p>
    </div>
  );
}