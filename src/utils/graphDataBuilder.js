// src/utils/graphDataBuilder.js

// ─── Auto-positioning helper ───
function getPosition(course, allCourses) {
  const coursesInSameYear = allCourses.filter(
    (c) => c.yearLevel === course.yearLevel
  );
  const indexWithinGroup = coursesInSameYear.findIndex(
    (c) => c.courseCode === course.courseCode
  );
  return {
    x: course.yearLevel * 250,
    y: indexWithinGroup * 120,
  };
}

// ─── TASK 1 — filterByYearLevel() ───
export function filterByYearLevel(courses, yearLevel) {
  if (yearLevel === null || yearLevel === undefined) return courses;
  return courses.filter((c) => c.yearLevel === yearLevel);
}

// ─── TASK 2 — filterBySemester() ───
export function filterBySemester(courses, semester) {
  if (semester === null || semester === undefined) return courses;
  return courses.filter((c) => c.semester === semester);
}

// ─── TASK 3 — filterBySkill() ───
export function filterBySkill(courses, skill) {
  if (!skill) return courses;
  const lowerSkill = skill.toLowerCase();
  return courses.filter(
    (c) =>
      c.skillsLearned &&
      c.skillsLearned.some((s) => s.toLowerCase().includes(lowerSkill))
  );
}

// ─── TASK 4 — filterByDepartment() ───
export function filterByDepartment(courses, department) {
  if (department === null || department === undefined) return courses;
  return courses.filter((c) => c.department === department);
}

// ─── TASK 5 — buildGraphData() with optional filters ───
export function buildGraphData(courses, filters = {}) {
  // Apply non-null filters
  let filtered = [...courses];

  if (filters.yearLevel != null) {
    filtered = filterByYearLevel(filtered, filters.yearLevel);
  }
  if (filters.semester != null) {
    filtered = filterBySemester(filtered, filters.semester);
  }
  if (filters.skill != null) {
    filtered = filterBySkill(filtered, filters.skill);
  }
  if (filters.department != null) {
    filtered = filterByDepartment(filtered, filters.department);
  }

  // Build node IDs set for orphan edge prevention
  const nodeIds = new Set(filtered.map((c) => c.courseCode));

  // Build nodes
  const nodes = filtered.map((course) => ({
    id: course.courseCode,
    data: {
      courseCode: course.courseCode,
      courseTitle: course.courseTitle,
      yearLevel: course.yearLevel,
    },
    position: getPosition(course, filtered),
  }));

  // Build edges — only include edges where both source and target exist in filtered nodes
  const edges = [];
  filtered.forEach((course) => {
    if (course.prerequisites && course.prerequisites.length > 0) {
      course.prerequisites.forEach((prereqCode) => {
        if (nodeIds.has(prereqCode)) {
          edges.push({
            id: `${prereqCode}-${course.courseCode}`,
            source: prereqCode,
            target: course.courseCode,
          });
        }
      });
    }
  });

  return { nodes, edges };
}