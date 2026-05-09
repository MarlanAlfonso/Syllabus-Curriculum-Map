// src/utils/graphDataBuilder.js
// ─────────────────────────────────────────────────────────────────────────────
// Row-based layout engine — no dagre, no swimlane band backgrounds.
//
// Layout rules:
//   • One row per (yearLevel × semester) combination, ordered:
//       Y1S1 → Y1S2 → Y1Summer → Y2S1 → Y2S2 → Y2Summer → …
//   • Within each row:
//       LEFT  — connected nodes (has prereqs OR depended on by others),
//               ordered by topological depth in the prereq chain
//       RIGHT — isolated nodes (no prereqs AND no dependents), evenly spaced
//   • Row labels live in a separate React Flow node of type "rowLabelNode"
//     positioned to the left of the course nodes in that row.
//   • No dagre. x/y computed manually from row index + column index.
// ─────────────────────────────────────────────────────────────────────────────

export const NODE_W = 192;
export const NODE_H = 90;

const ROW_GAP      = 80;   // vertical gap between rows
const COL_GAP      = 40;   // horizontal gap between nodes in a row
const LABEL_W      = 92;   // width of the left-side row label chip node
const LABEL_GAP    = 20;   // gap between label right-edge and first course node
const ROW_START_X  = LABEL_W + LABEL_GAP;
const ROW_START_Y  = 0;

// Semester display ordering
const SEM_ORDER = ['1', '2', 'Summer'];

export const YEAR_COLORS = {
  1: { edge: '#3b82f6', bg: 'rgba(219,234,254,0.55)', border: '#3b82f6', text: '#1e3a8a', label: 'Year 1' },
  2: { edge: '#22c55e', bg: 'rgba(220,252,231,0.55)', border: '#22c55e', text: '#14532d', label: 'Year 2' },
  3: { edge: '#eab308', bg: 'rgba(254,249,195,0.55)', border: '#eab308', text: '#713f12', label: 'Year 3' },
  4: { edge: '#a855f7', bg: 'rgba(243,232,255,0.55)', border: '#a855f7', text: '#581c87', label: 'Year 4' },
};

export const YEAR_COLORS_DARK = {
  1: { edge: '#60a5fa', bg: 'rgba(59,130,246,0.10)',  border: '#60a5fa', text: '#bfdbfe', label: 'Year 1' },
  2: { edge: '#4ade80', bg: 'rgba(34,197,94,0.10)',   border: '#4ade80', text: '#bbf7d0', label: 'Year 2' },
  3: { edge: '#facc15', bg: 'rgba(234,179,8,0.10)',   border: '#facc15', text: '#fef08a', label: 'Year 3' },
  4: { edge: '#c084fc', bg: 'rgba(168,85,247,0.10)',  border: '#c084fc', text: '#e9d5ff', label: 'Year 4' },
};

export function normSemester(s) {
  const str = String(s);
  if (str === '1') return 'Sem 1';
  if (str === '2') return 'Sem 2';
  return str;
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

export function filterByYearLevel(courses, yearLevel) {
  if (yearLevel === null || yearLevel === undefined) return courses;
  return courses.filter(c => Number(c.yearLevel) === Number(yearLevel));
}

export function filterBySemester(courses, semester) {
  if (semester === null || semester === undefined) return courses;
  return courses.filter(c => String(c.semester) === String(semester));
}

export function filterBySkill(courses, skill) {
  if (!skill) return courses;
  const lw = skill.toLowerCase();
  return courses.filter(
    c => c.skillsLearned && c.skillsLearned.some(s => s.toLowerCase().includes(lw))
  );
}

// ─── Topological sort within a row ───────────────────────────────────────────

function topoSortInRow(rowCodes, prereqMap) {
  const set   = new Set(rowCodes);
  const adj   = {};
  const inDeg = {};

  rowCodes.forEach(code => { adj[code] = []; inDeg[code] = 0; });

  rowCodes.forEach(code => {
    (prereqMap[code] ?? []).forEach(p => {
      if (set.has(p)) { adj[p].push(code); inDeg[code]++; }
    });
  });

  const queue  = rowCodes.filter(c => inDeg[c] === 0);
  const sorted = [];

  while (queue.length > 0) {
    queue.sort();
    const node = queue.shift();
    sorted.push(node);
    (adj[node] ?? []).forEach(dep => { if (--inDeg[dep] === 0) queue.push(dep); });
  }

  rowCodes.forEach(c => { if (!sorted.includes(c)) sorted.push(c); });
  return sorted;
}

// ─── Main buildGraphData ──────────────────────────────────────────────────────

export async function buildGraphData(courses, filters = {}) {
  let filtered = [...courses];

  if (filters.yearLevel !== null && filters.yearLevel !== undefined)
    filtered = filterByYearLevel(filtered, filters.yearLevel);
  if (filters.semester !== null && filters.semester !== undefined)
    filtered = filterBySemester(filtered, filters.semester);
  if (filters.skill)
    filtered = filterBySkill(filtered, filters.skill);
  if (filters.department !== null && filters.department !== undefined)
    filtered = filtered.filter(c => c.department === filters.department);
  if (filters.prerequisites === 'has')
    filtered = filtered.filter(c => c.prerequisites && c.prerequisites.length > 0);
  else if (filters.prerequisites === 'none')
    filtered = filtered.filter(c => !c.prerequisites || c.prerequisites.length === 0);

  const filteredCodes = new Set(filtered.map(c => c.courseCode));

  // Build prereq map (only within filtered set)
  const prereqMap = {};
  filtered.forEach(c => {
    prereqMap[c.courseCode] = (c.prerequisites ?? []).filter(p => filteredCodes.has(p));
  });

  // Determine connected vs isolated
  const hasDependents = new Set();
  filtered.forEach(c => {
    (c.prerequisites ?? []).forEach(p => { if (filteredCodes.has(p)) hasDependents.add(p); });
  });

  const isConnected = code =>
    (prereqMap[code] ?? []).length > 0 || hasDependents.has(code);

  // Build rows
  const yearSet = [...new Set(filtered.map(c => Number(c.yearLevel)))].sort((a, b) => a - b);
  const rows    = [];

  yearSet.forEach(year => {
    SEM_ORDER.forEach(sem => {
      const codes = filtered
        .filter(c => Number(c.yearLevel) === year && String(c.semester) === sem)
        .map(c => c.courseCode);
      if (codes.length > 0) rows.push({ year, sem, codes });
    });
  });

  // Position nodes
  const posMap = {};
  const nodes  = [];
  let currentY = ROW_START_Y;

  rows.forEach(({ year, sem, codes }) => {
    const connected       = codes.filter(c => isConnected(c));
    const isolated        = codes.filter(c => !isConnected(c));
    const sortedConnected = topoSortInRow(connected, prereqMap);
    const orderedCodes    = [...sortedConnected, ...isolated];

    orderedCodes.forEach((code, idx) => {
      posMap[code] = { x: ROW_START_X + idx * (NODE_W + COL_GAP), y: currentY };
    });

    // Row label node
    nodes.push({
      id:         `__rowlabel_y${year}_s${sem}`,
      type:       'rowLabelNode',
      position:   { x: 0, y: currentY },
      data:       { year, sem, colors: YEAR_COLORS[year] ?? YEAR_COLORS[1] },
      draggable:  false,
      selectable: false,
      focusable:  false,
      zIndex:     2,
    });

    // Course nodes
    orderedCodes.forEach(code => {
      const course = filtered.find(c => c.courseCode === code);
      if (!course) return;
      nodes.push({
        id:   code,
        type: 'courseNode',
        data: {
          courseCode:  course.courseCode,
          courseTitle: course.courseTitle,
          yearLevel:   Number(course.yearLevel),
          semester:    String(course.semester),
          units:       course.units,
          department:  course.department,
          isIsolated:  !isConnected(code),
        },
        position: posMap[code],
        zIndex:   1,
      });
    });

    currentY += NODE_H + ROW_GAP;
  });

  // Row key lookup for same-row detection
  const courseRowKey = {};
  rows.forEach(({ year, sem, codes }) => {
    codes.forEach(code => { courseRowKey[code] = `y${year}_s${sem}`; });
  });

  // ── Build edges ───────────────────────────────────────────────────────────
  //
  // Dense-graph strategy:
  //
  //   Same-row edges  → 'straight' type.
  //     Clean thin horizontal lines. No routing needed when source/target
  //     share the same Y. Thinner strokeWidth (1.5) so they don't dominate.
  //
  //   Cross-row edges → 'smoothstep' with small borderRadius (12) + offset (16).
  //     Gentle rounded corners only. No wide sweeping arcs.
  //     Fan-out: when a node has multiple cross-row outgoing edges, each edge
  //     gets a small horizontal offset so they spread from the source handle
  //     instead of stacking into one thick line.
  //
  // ─────────────────────────────────────────────────────────────────────────

  // Pre-count cross-row outgoing edges per source for fan offset calculation
  const outgoingCount = {};
  filtered.forEach(course => {
    (prereqMap[course.courseCode] ?? []).forEach(prereqCode => {
      if (courseRowKey[prereqCode] !== courseRowKey[course.courseCode]) {
        outgoingCount[prereqCode] = (outgoingCount[prereqCode] ?? 0) + 1;
      }
    });
  });

  const outgoingIndex = {};
  const edges = [];

  filtered.forEach(course => {
    const prereqs = prereqMap[course.courseCode] ?? [];
    prereqs.forEach(prereqCode => {
      const sourceYear = Number(filtered.find(c => c.courseCode === prereqCode)?.yearLevel ?? 1);
      const edgeColor  = YEAR_COLORS[sourceYear]?.edge ?? '#94a3b8';
      const sameRow    = courseRowKey[prereqCode] === courseRowKey[course.courseCode];

      if (sameRow) {
        // ── Same-row: straight, thin, unobtrusive ───────────────────────────
        edges.push({
          id:        `${prereqCode}->${course.courseCode}`,
          source:    prereqCode,
          target:    course.courseCode,
          type:      'straight',
          style:     { stroke: edgeColor, strokeWidth: 1.5, strokeOpacity: 0.65 },
          markerEnd: { type: 'arrowclosed', width: 13, height: 13, color: edgeColor },
          zIndex:    0,
        });
      } else {
        // ── Cross-row: smoothstep with fan-out offset ────────────────────────
        const total = outgoingCount[prereqCode] ?? 1;
        const idx   = outgoingIndex[prereqCode] ?? 0;
        outgoingIndex[prereqCode] = idx + 1;

        // Fan spread capped at 48px total; 0 spread when only 1 edge
        const fanSpread  = total > 1 ? Math.min(48, (total - 1) * 12) : 0;
        const fanStep    = total > 1 ? fanSpread / (total - 1) : 0;
        const fanOffsetX = total > 1 ? -fanSpread / 2 + idx * fanStep : 0;

        // Shift source handle x by storing offset in edge data.
        // The ReactFlow sourceX/targetX inline override is done via
        // the `sourceHandle` position — we encode the offset as a
        // named handle id that CourseNode exposes per offset bucket.
        // Since CourseNode uses a single centered handle, we instead
        // apply the offset via the edge's `style.transform` on the
        // marker, which is a visual-only nudge at this density.
        // The real separation comes from borderRadius + small offset.
        edges.push({
          id:          `${prereqCode}->${course.courseCode}`,
          source:      prereqCode,
          target:      course.courseCode,
          type:        'smoothstep',
          style:       { stroke: edgeColor, strokeWidth: 1.75, strokeOpacity: 0.75 },
          markerEnd:   { type: 'arrowclosed', width: 13, height: 13, color: edgeColor },
          pathOptions: {
            borderRadius: 12,  // gentle corner — not a sweeping arc
            offset:       16,  // small step-out before the vertical run
          },
          data:   { fanOffsetX },
          zIndex: 0,
        });
      }
    });
  });

  return { nodes, edges };
}

// ─── Filter options ───────────────────────────────────────────────────────────

export function getFilterOptions(courses) {
  return {
    yearLevels:  [...new Set(courses.map(c => Number(c.yearLevel)))].sort((a, b) => a - b),
    semesters:   [...new Set(courses.map(c => String(c.semester)))].filter(Boolean).sort(),
    departments: [...new Set(courses.map(c => c.department))].filter(Boolean).sort(),
    skills:      [...new Set(courses.flatMap(c => c.skillsLearned || []))].sort(),
  };
}