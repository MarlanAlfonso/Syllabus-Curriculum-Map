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

// ─── TASK 4 — filterByDepartment() ───
export function filterByDepartment(courses, department) {
  if (department === null || department === undefined) return courses;
  return courses.filter((c) => c.department === department);
}

// ─── TASK 5 — buildGraphData() with optional filters ───
/**
 * Converts courses array to React Flow nodes and edges
 * Supports filtering by yearLevel, semester, skill, and department
 * 
 * @param {Array} courses - Array of course objects from Firestore
 * @param {Object} filters - Optional filter object
 *   - filters.yearLevel: number or null
 *   - filters.semester: string or null
 *   - filters.skill: string or null
 *   - filters.department: string or null
 * @returns {Object} { nodes, edges } - React Flow compatible data
 */
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

  // Build nodes with enhanced styling
  const nodes = filtered.map((course) => {
    const position = getPosition(course, filtered);
    
    return {
      id: course.courseCode,
      data: {
        label: `${course.courseCode}\n${course.courseTitle}`,
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        yearLevel: course.yearLevel,
      },
      position,
      style: {
        background: '#fff',
        border: '2px solid #3498db',
        borderRadius: '8px',
        padding: '12px',
        width: '160px',
        minHeight: '70px',
        fontWeight: 'bold',
        fontSize: '12px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        overflow: 'visible',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      }
    };
  });

  // Build edges with directed arrows
  // Only include edges where both source and target exist in filtered nodes
  const edges = [];
  const edgeSet = new Set(); // Prevent duplicates

  filtered.forEach((course) => {
    if (course.prerequisites && course.prerequisites.length > 0) {
      course.prerequisites.forEach((prereqCode) => {
        if (nodeIds.has(prereqCode)) {
          const edgeId = `${prereqCode}-${course.courseCode}`;
          
          // Avoid duplicate edges
          if (!edgeSet.has(edgeId)) {
            edges.push({
              id: edgeId,
              source: prereqCode,
              target: course.courseCode,
              animated: false,
              markerEnd: { type: 'arrowclosed' }, // ← Directed arrow from prerequisite to dependent
              style: {
                strokeWidth: 2,
                stroke: '#95a5a6'
              }
            });
            edgeSet.add(edgeId);
          }
        }
      });
    }
  });

  // Debug logging
  console.log(`✅ Built curriculum graph:`);
  console.log(`   Nodes: ${nodes.length}`);
  console.log(`   Edges: ${edges.length}`);
  console.log(`   Course codes: ${nodes.map(n => n.id).join(', ')}`);
  
  if (nodes.length < courses.length) {
    console.warn(`⚠️ Warning: Filtered from ${courses.length} to ${nodes.length} courses`);
  }

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