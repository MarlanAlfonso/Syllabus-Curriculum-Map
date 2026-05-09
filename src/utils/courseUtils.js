// ── Sort ───────────────────────────────────────────────────────────────────
const semOrder = { '1': 0, '2': 1, 'Summer': 2 };

export function sortCourses(courses) {
  return [...courses].sort((a, b) => {
    if (a.yearLevel !== b.yearLevel) return a.yearLevel - b.yearLevel;
    return (semOrder[String(a.semester)] ?? 9) - (semOrder[String(b.semester)] ?? 9);
  });
}

// ── Label helpers ──────────────────────────────────────────────────────────

/**
 * Returns a compact combined label e.g. "Y3 · Sem 2" or "Y1 · Summer"
 */
export function formatYearSemester(yearLevel, semester) {
  const sem = String(semester);
  let semLabel;
  if (sem === '1') semLabel = 'Sem 1';
  else if (sem === '2') semLabel = 'Sem 2';
  else semLabel = 'Summer';
  return `Y${yearLevel} · ${semLabel}`;
}

// ── CSV Export ─────────────────────────────────────────────────────────────

/**
 * Converts a courses array to a CSV file and triggers browser download.
 * @param {Array}  courses   - Filtered course list to export
 * @param {string} filename  - Base filename (without .csv)
 */
export function exportToCSV(courses, filename = 'courses') {
  const headers = ['Code', 'Title', 'Units', 'Year Level', 'Semester', 'Prerequisites', 'Skills Learned', 'Knowledge Built'];

  const escape = (val) => {
    if (val == null) return '';
    const str = Array.isArray(val) ? val.join('; ') : String(val);
    // Wrap in quotes if contains comma, quote, or newline
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const rows = courses.map(c => [
    escape(c.courseCode),
    escape(c.courseTitle),
    escape(c.units),
    escape(c.yearLevel ? `Year ${c.yearLevel}` : ''),
    escape(c.semester),
    escape(c.prerequisites),
    escape(c.skillsLearned),
    escape(c.knowledgeBuilt),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}