// src/utils/graphDataBuilder.js

// TASK 2 — Auto-positioning helper
// Groups courses by yearLevel and stacks them vertically within each group
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

// TASK 1 — Main buildGraphData() function
export function buildGraphData(courses) {
  // Build nodes — one per course
  const nodes = courses.map((course) => ({
    id: course.courseCode,
    data: {
      courseCode: course.courseCode,
      courseTitle: course.courseTitle,
      yearLevel: course.yearLevel,
    },
    position: getPosition(course, courses),
  }));

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