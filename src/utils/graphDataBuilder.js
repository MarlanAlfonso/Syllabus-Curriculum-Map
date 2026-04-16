// src/utils/graphDataBuilder.js

/**
 * Auto-positioning helper with grid layout
 * Groups courses by year and semester, positions in grid to prevent overlaps
 * 
 * Grid layout:
 * - Each year/semester combo gets a column
 * - Courses arranged vertically within each column
 * - Spacing: 320px horizontal, 200px vertical (prevents overlaps)
 * 
 * Layout example for 4 years × 2 semesters:
 * Y1S1 | Y1S2 | Y2S1 | Y2S2 | Y3S1 | Y3S2 | Y4S1 | Y4S2
 *   0    320    640    960   1280   1600   1920   2240  (x positions)
 */
function getPosition(course, allCourses) {
  const semesterNum =
    typeof course.semester === "string"
      ? course.semester.includes("1")
        ? 1
        : 2
      : course.semester;

  const yearIndex = Number(course.yearLevel) - 1;
  const semesterIndex = semesterNum === 1 ? 0 : 1;

  const columnX = (yearIndex * 2 + semesterIndex) * 320;

  const group = allCourses
    .filter(
      (c) =>
        Number(c.yearLevel) === Number(course.yearLevel) &&
        Number(c.semester) === Number(course.semester)
    )
    .sort((a, b) => a.courseCode.localeCompare(b.courseCode));

  const index = group.findIndex((c) => c.courseCode === course.courseCode);

  return {
    x: columnX,
    y: index * 200,
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

// TASK 1 — Main buildGraphData() function
export function buildGraphData(courses) {
  // Build nodes — one per course
  const courseCodes = new Set(courses.map((c) => c.courseCode));

  const nodes = courses.map((course) => {
    const isIsolated =
      (!course.prerequisites || course.prerequisites.length === 0) &&
      !courses.some(
        (c) => c.prerequisites && c.prerequisites.includes(course.courseCode)
      );

    return {
      id: course.courseCode,
      type: 'courseNode',
      data: {
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        yearLevel: Number(course.yearLevel),
        isIsolated,
      },
      position: getPosition(course, courses),
    };
  });

  // Build edges — one per prerequisite link
  const edges = [];
  courses.forEach((course) => {
    if (course.prerequisites && course.prerequisites.length > 0) {
      course.prerequisites.forEach((prereqCode) => {
        edges.push({
          id: `${prereqCode}-${course.courseCode}`,
          source: prereqCode,
          target: course.courseCode,
        });
      });
    }
  });

  return { nodes, edges };
}

/**
 * Get available unique values for filtering
 * Useful for populating dropdown filters
 */
export function getFilterOptions(courses) {
  return {
    yearLevels: [...new Set(courses.map(c => c.yearLevel))].sort((a, b) => a - b),
    semesters: [...new Set(courses.map(c => c.semester))].filter(Boolean).sort(),
    departments: [...new Set(courses.map(c => c.department))].filter(Boolean).sort(),
    skills: [...new Set(
      courses.flatMap(c => c.skillsLearned || [])
    )].sort()
  };
}

/**
 * Helper function: Get layout bounds
 * Useful for auto-sizing canvas or debugging
 */
export function getLayoutBounds(nodes) {
  if (nodes.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  nodes.forEach(node => {
    const x = node.position.x;
    const y = node.position.y;
    const nodeWidth = 160;
    const nodeHeight = 70;

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + nodeWidth);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + nodeHeight);
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX + 40,  // Add padding
    height: maxY - minY + 40  // Add padding
  };
}