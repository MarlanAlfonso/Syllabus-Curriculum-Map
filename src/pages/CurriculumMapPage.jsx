// src/pages/CurriculumMapPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Row-based layout: no dagre, no swimlane band backgrounds.
// SwimlaneNode is now registered as "rowLabelNode" — renders a left-side chip.
// TIMELINE: per-row horizontal scroll, no global bottom scrollbar.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { getCourses } from '../services/courseService';
import { buildGraphData, getFilterOptions, YEAR_COLORS, YEAR_COLORS_DARK } from '../utils/graphDataBuilder';
import {
  ReactFlow, Controls, Background, ReactFlowProvider, useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CourseNode    from '../components/map/CourseNode';
import SwimlaneNode  from '../components/map/SwimlaneNode';
import CourseDetailPanel from '../components/map/CourseDetailPanel';
import '../styles/CurriculumMapPage.css';

const nodeTypes = {
  courseNode:    CourseNode,
  rowLabelNode:  SwimlaneNode,
};

const DEFAULT_FILTERS = {
  yearLevel:     null,
  semester:      null,
  skill:         null,
  department:    null,
  prerequisites: null,
};

// ── Dark mode hook ─────────────────────────────────────────────────────────────
function useIsDark() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('scm-dark');
    if (saved !== null) return saved === 'true';
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const saved = localStorage.getItem('scm-dark');
      if (saved !== null) { setIsDark(saved === 'true'); return; }
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'dark')  { setIsDark(true);  return; }
      if (theme === 'light') { setIsDark(false); return; }
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme', 'class'],
    });
    const onStorage = e => { if (e.key === 'scm-dark') setIsDark(e.newValue === 'true'); };
    window.addEventListener('storage', onStorage);
    return () => { observer.disconnect(); window.removeEventListener('storage', onStorage); };
  }, []);

  return isDark;
}

// ── "Has prerequisites" filter includes both ends of edges ────────────────────
async function buildGraphDataWithConnectedNodes(courses, filters) {
  if (filters.prerequisites === 'has') {
    const withPrereqs = courses.filter(c => c.prerequisites && c.prerequisites.length > 0);
    const prereqCodes = new Set(withPrereqs.flatMap(c => c.prerequisites));
    const connected   = new Set([...withPrereqs.map(c => c.courseCode), ...prereqCodes]);
    let filtered = courses.filter(c => connected.has(c.courseCode));
    const mf = { ...filters, prerequisites: null };
    if (mf.yearLevel  != null) filtered = filtered.filter(c => Number(c.yearLevel)  === Number(mf.yearLevel));
    if (mf.semester   != null) filtered = filtered.filter(c => String(c.semester)   === String(mf.semester));
    if (mf.department != null) filtered = filtered.filter(c => c.department         === mf.department);
    if (mf.skill)              filtered = filtered.filter(c =>
      c.skillsLearned?.some(s => s.toLowerCase().includes(mf.skill.toLowerCase()))
    );
    return buildGraphData(filtered, { ...mf, prerequisites: null });
  }
  return buildGraphData(courses, filters);
}

// ── FlowCanvas ─────────────────────────────────────────────────────────────────
function FlowCanvas({ nodes, edges, onNodeClick, selectedCourse, onClosePanel, filters, highlightedNodes }) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  useEffect(() => {
    const t = setTimeout(() => fitView({ duration: 500, padding: 0.15 }), 80);
    return () => clearTimeout(t);
  }, [filters, fitView, nodes.length]);

  useEffect(() => {
    const handler = e => {
      if (e.key === '=' || e.key === '+') zoomIn({ duration: 200 });
      if (e.key === '-')                   zoomOut({ duration: 200 });
      if (e.key === 'f' || e.key === 'F') fitView({ duration: 400, padding: 0.15 });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [zoomIn, zoomOut, fitView]);

  const displayNodes = useMemo(() => {
    if (!highlightedNodes || highlightedNodes.size === 0) return nodes;
    return nodes.map(n => {
      if (n.type !== 'courseNode') return n;
      return { ...n, data: { ...n.data, dimmed: !highlightedNodes.has(n.id) } };
    });
  }, [nodes, highlightedNodes]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.08}
        maxZoom={2.5}
        panOnScroll
        zoomOnPinch
        panOnDrag
        zoomOnScroll
        edgesFocusable={false}
        defaultEdgeOptions={{
          style:    { strokeWidth: 2 },
          animated: false,
        }}
      >
        <Background color="var(--map-flow-bg-dot)" gap={24} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {selectedCourse && (
        <CourseDetailPanel course={selectedCourse} onClose={onClosePanel} />
      )}
    </div>
  );
}

// ── TimelineView ───────────────────────────────────────────────────────────────
// CHANGED: per-row horizontal scroll. Each row has its own overflow-x:auto strip.
// The outer .timeline-view only scrolls vertically. No global horizontal scrollbar.
function TimelineView({ courses, onSelectCourse, isDark }) {
  const SEM_ORDER = ['1', '2', 'Summer'];
  const years     = [...new Set(courses.map(c => Number(c.yearLevel)))].sort();
  const YC        = isDark ? YEAR_COLORS_DARK : YEAR_COLORS;
  const semLabel  = s => s === 'Summer' ? 'Summer' : `Semester ${s}`;

  const rows = [];
  years.forEach(y => {
    SEM_ORDER.forEach(s => {
      const list = courses.filter(c => Number(c.yearLevel) === y && String(c.semester) === s);
      if (list.length > 0) rows.push({ year: y, sem: s, courses: list });
    });
  });

  return (
    // CHANGED: overflow-x:hidden on the outer wrapper kills the global bottom scrollbar
    <div className="timeline-view" style={{ overflowX: 'hidden' }}>
      {rows.map(({ year, sem, courses: rc }) => {
        const yc = YC[year] ?? YC[1];
        return (
          <div key={`${year}-${sem}`} className="timeline-row">
            {/* Sticky left label */}
            <div className="timeline-row-label" style={{ borderLeftColor: yc.border }}>
              <span className="timeline-year-badge"
                style={{ background: yc.bg, color: yc.text, borderColor: yc.border }}>
                Y{year}
              </span>
              <span className="timeline-sem-text">{semLabel(sem)}</span>
              <span className="timeline-count">{rc.length} courses</span>
            </div>

            {/* CHANGED: wrapper clips the row, cards strip scrolls independently */}
            <div className="timeline-cards-wrapper">
              <div className="timeline-cards">
                {rc.map(c => (
                  <button key={c.courseCode} className="timeline-card"
                    style={{ borderTopColor: yc.border }} onClick={() => onSelectCourse(c)}>
                    <span className="timeline-card-code">{c.courseCode}</span>
                    <span className="timeline-card-title">{c.courseTitle}</span>
                    <span className="timeline-card-units">
                      {c.units} {c.units === 1 ? 'unit' : 'units'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────────
function Legend({ visible, onClose, isDark }) {
  const YC = isDark ? YEAR_COLORS_DARK : YEAR_COLORS;
  if (!visible) return null;
  return (
    <div className="map-legend">
      <div className="map-legend-header">
        <span className="map-legend-title">Legend</span>
        <button onClick={onClose} className="map-legend-close">×</button>
      </div>
      <div className="map-legend-section">
        <p className="map-legend-label">Year Level</p>
        {Object.entries(YC).map(([y, c]) => (
          <div key={y} className="map-legend-row">
            <span className="map-legend-swatch" style={{ background: c.bg, borderColor: c.border }} />
            <span style={{ color: c.text, fontWeight: 600 }}>{c.label}</span>
          </div>
        ))}
      </div>
      <div className="map-legend-section">
        <p className="map-legend-label">Node types</p>
        <div className="map-legend-row">
          <span className="map-legend-swatch"
            style={{ background: 'transparent', borderColor: '#9ca3af', borderStyle: 'dashed' }} />
          <span>◇ Foundational (no prereqs)</span>
        </div>
      </div>
      <div className="map-legend-section">
        <p className="map-legend-label">Edge colors</p>
        {Object.entries(YC).map(([y, c]) => (
          <div key={`e${y}`} className="map-legend-row">
            <span className="map-legend-line" style={{ background: c.edge }} />
            <span>Prereq from {c.label}</span>
          </div>
        ))}
      </div>
      <div className="map-legend-shortcuts">
        <p className="map-legend-label">Shortcuts</p>
        <div className="map-legend-row"><kbd>+</kbd><span>Zoom in</span></div>
        <div className="map-legend-row"><kbd>−</kbd><span>Zoom out</span></div>
        <div className="map-legend-row"><kbd>F</kbd><span>Fit view</span></div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CurriculumMapPage() {
  const isDark = useIsDark();

  const [courses,        setCourses]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [layoutLoading,  setLayoutLoading]  = useState(false);
  const [error,          setError]          = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [filterOptions,  setFilterOptions]  = useState({
    yearLevels: [], semesters: [], departments: [], skills: [],
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeTab,      setActiveTab]      = useState('graph');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [legendVisible,  setLegendVisible]  = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState(null);
  const [graphData,      setGraphData]      = useState({ nodes: [], edges: [] });

  useEffect(() => {
    if (courses.length === 0) { setGraphData({ nodes: [], edges: [] }); return; }
    setLayoutLoading(true);
    buildGraphDataWithConnectedNodes(courses, filters)
      .then(data  => setGraphData(data))
      .catch(err  => console.error('Layout error:', err))
      .finally(() => setLayoutLoading(false));
  }, [courses, filters]);

  const filteredCourses = useMemo(() => {
    let list = [...courses];
    if (filters.yearLevel  != null) list = list.filter(c => Number(c.yearLevel)  === Number(filters.yearLevel));
    if (filters.semester   != null) list = list.filter(c => String(c.semester)   === String(filters.semester));
    if (filters.department != null) list = list.filter(c => c.department         === filters.department);
    if (filters.skill)              list = list.filter(c =>
      c.skillsLearned?.some(s => s.toLowerCase().includes(filters.skill.toLowerCase())));
    if (filters.prerequisites === 'has')  list = list.filter(c => c.prerequisites?.length > 0);
    if (filters.prerequisites === 'none') list = list.filter(c => !c.prerequisites?.length);
    return list;
  }, [courses, filters]);

  useEffect(() => {
    if (!searchQuery.trim()) { setHighlightedNodes(null); return; }
    const q       = searchQuery.toLowerCase();
    const matched = new Set(
      courses.filter(c =>
        c.courseCode?.toLowerCase().includes(q) ||
        c.courseTitle?.toLowerCase().includes(q)
      ).map(c => c.courseCode)
    );
    setHighlightedNodes(matched.size > 0 ? matched : null);
  }, [searchQuery, courses]);

  const runFetch = async () => {
    setLoading(true); setError(null);
    try {
      const result = await getCourses();
      if (!result?.length) { setError('No courses found in Firestore'); setCourses([]); }
      else { setCourses(result); setFilterOptions(getFilterOptions(result)); }
    } catch (err) {
      setError(err.message || 'Failed to load curriculum data');
    } finally {
      setLoading(false);
    }
  };

  const fetchedRef = useRef(false);
  if (!fetchedRef.current) { fetchedRef.current = true; runFetch(); }

  const handleFilterChange = (key, value) => setFilters(p => ({ ...p, [key]: value }));
  const handleClearFilters = () => { setFilters(DEFAULT_FILTERS); setFilterDrawerOpen(false); };
  const handleNodeClick    = useCallback((_, node) => {
    if (node.type === 'rowLabelNode') return;
    setSelectedCourse(courses.find(c => c.courseCode === node.id) ?? null);
  }, [courses]);
  const handleSelectCourse = useCallback(c => setSelectedCourse(c), []);

  const hasActiveFilters = Object.values(filters).some(v => v !== null);
  const graphHasNodes    = graphData.nodes.some(n => n.type === 'courseNode');

  const filterFields = (
    <>
      <div className="filter-field">
        <span className="filter-label">Year</span>
        <select className={`filter-select${filters.yearLevel ? ' active' : ''}`}
          value={filters.yearLevel ?? ''}
          onChange={e => handleFilterChange('yearLevel', e.target.value ? Number(e.target.value) : null)}>
          <option value="">All</option>
          {(filterOptions.yearLevels.length ? filterOptions.yearLevels : [1,2,3,4]).map(y => (
            <option key={y} value={y}>Year {y}</option>
          ))}
        </select>
      </div>
      <div className="filter-field">
        <span className="filter-label">Semester</span>
        <select className={`filter-select${filters.semester ? ' active' : ''}`}
          value={filters.semester ?? ''}
          onChange={e => handleFilterChange('semester', e.target.value || null)}>
          <option value="">All</option>
          {(filterOptions.semesters.length ? filterOptions.semesters : ['1','2','Summer']).map(s => (
            <option key={s} value={s}>
              {s === '1' ? 'Semester 1' : s === '2' ? 'Semester 2' : 'Summer'}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-field">
        <span className="filter-label">Department</span>
        <select className={`filter-select${filters.department ? ' active' : ''}`}
          value={filters.department ?? ''}
          onChange={e => handleFilterChange('department', e.target.value || null)}>
          <option value="">All</option>
          {filterOptions.departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="filter-field">
        <span className="filter-label">Prerequisites</span>
        <select className={`filter-select${filters.prerequisites ? ' active' : ''}`}
          value={filters.prerequisites ?? ''}
          onChange={e => handleFilterChange('prerequisites', e.target.value || null)}>
          <option value="">All</option>
          <option value="has">Has prerequisites</option>
          <option value="none">No prerequisites</option>
        </select>
      </div>
      <div className="filter-field">
        <span className="filter-label">Skills</span>
        <input type="text" placeholder="e.g. algorithms"
          className={`filter-input${filters.skill ? ' active' : ''}`}
          value={filters.skill ?? ''}
          onChange={e => handleFilterChange('skill', e.target.value || null)} />
      </div>
    </>
  );

  return (
    <div className="map-page-root" data-dark={isDark ? 'true' : 'false'}>

      {/* ── Top bar ── */}
      <div className="map-topbar">
        <div className="map-topbar-left">
          <div className="map-topbar-brand">
            <span className="map-topbar-overline">ACADEMIC</span>
            <span className="map-topbar-title">Curriculum Map</span>
          </div>
          <span className="map-course-count-pill">{courses.length} courses</span>
        </div>

        <div className="map-topbar-search-wrap map-topbar-search--desktop">
          <SearchIcon className="map-search-icon" />
          <input className="map-search-input" placeholder="Search courses… (code or title)"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          {searchQuery && (
            <button className="map-search-clear" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="map-topbar-right">
          <div className="map-view-tabs">
            {[{ id: 'graph', label: 'Graph', icon: '⬡' }, { id: 'timeline', label: 'Timeline', icon: '▤' }].map(tab => (
              <button key={tab.id}
                className={`map-view-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                <span className="map-view-tab-icon">{tab.icon}</span>
                <span className="map-view-tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="map-topbar-divider" />
          <button className={`map-btn-icon${hasActiveFilters ? ' active' : ''}`}
            onClick={() => setFilterDrawerOpen(o => !o)} title="Filters">
            <FilterIcon />
            {hasActiveFilters && (
              <span className="map-filter-badge">
                {Object.values(filters).filter(v => v !== null).length}
              </span>
            )}
          </button>
          {activeTab === 'graph' && (
            <button className={`map-btn-icon${legendVisible ? ' active' : ''}`}
              onClick={() => setLegendVisible(v => !v)} title="Legend">
              <LegendIcon />
            </button>
          )}
          <button onClick={runFetch} disabled={loading} className="map-btn-refresh" title="Refresh">
            <RefreshIcon />
            <span className="map-btn-refresh-label">{loading ? 'Loading…' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="map-mobile-search">
        <SearchIcon className="map-search-icon" />
        <input className="map-search-input" placeholder="Search courses…"
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        {searchQuery && <button className="map-search-clear" onClick={() => setSearchQuery('')}>×</button>}
      </div>

      {/* Filter panel */}
      {filterDrawerOpen && (
        <>
          <div className="map-drawer-backdrop" onClick={() => setFilterDrawerOpen(false)} />
          <div className="map-filter-panel">
            <div className="map-filter-panel-header">
              <span className="map-filter-panel-title">Filters</span>
              {hasActiveFilters && (
                <button onClick={handleClearFilters} className="map-filter-clear-btn">Clear all</button>
              )}
              <button onClick={() => setFilterDrawerOpen(false)} className="map-filter-close-btn">×</button>
            </div>
            <div className="map-filter-panel-body">{filterFields}</div>
          </div>
        </>
      )}

      <Legend visible={legendVisible} onClose={() => setLegendVisible(false)} isDark={isDark} />

      {/* Loading */}
      {(loading || layoutLoading) && (
        <div className="map-state-center">
          <div className="map-spinner" />
          <p className="map-state-text">
            {loading ? 'Loading curriculum data…' : 'Computing layout…'}
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="map-error-bar">
          <div>
            <p className="map-error-title">❌ {error}</p>
            <p className="map-error-sub">Check that Firestore collection 'courses' exists</p>
          </div>
          <button onClick={runFetch} className="map-btn-retry">Try Again</button>
        </div>
      )}

      {/* Views */}
      {!loading && !layoutLoading && !error && (
        <div className="map-canvas-wrapper">

          {activeTab === 'graph' && (
            graphHasNodes ? (
              <ReactFlowProvider>
                <FlowCanvas
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  onNodeClick={handleNodeClick}
                  selectedCourse={selectedCourse}
                  onClosePanel={() => setSelectedCourse(null)}
                  filters={filters}
                  highlightedNodes={highlightedNodes}
                />
              </ReactFlowProvider>
            ) : (
              <div className="map-state-center">
                <p className="map-state-emoji">{courses.length > 0 ? '🔍' : '📚'}</p>
                <p className="map-state-title">
                  {courses.length > 0 ? 'No Matching Courses' : 'No Courses Found'}
                </p>
                <p className="map-state-text">
                  {courses.length > 0
                    ? 'Try adjusting or clearing your filters'
                    : "Add courses to your Firestore 'courses' collection"}
                </p>
                {courses.length > 0 && (
                  <button onClick={handleClearFilters} className="map-btn-retry"
                    style={{ marginTop: 16 }}>Clear Filters</button>
                )}
              </div>
            )
          )}

          {activeTab === 'timeline' && (
            filteredCourses.length > 0 ? (
              <>
                <TimelineView
                  courses={filteredCourses}
                  onSelectCourse={handleSelectCourse}
                  isDark={isDark}
                />
                {selectedCourse && (
                  <CourseDetailPanel course={selectedCourse}
                    onClose={() => setSelectedCourse(null)} />
                )}
              </>
            ) : (
              <div className="map-state-center">
                <p className="map-state-emoji">🔍</p>
                <p className="map-state-title">No Matching Courses</p>
                <button onClick={handleClearFilters} className="map-btn-retry"
                  style={{ marginTop: 16 }}>Clear Filters</button>
              </div>
            )
          )}

        </div>
      )}
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8.5" cy="8.5" r="5.5" /><line x1="12.5" y1="12.5" x2="17" y2="17" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/>
      <line x1="2" y1="12" x2="14" y2="12"/>
      <circle cx="5"  cy="4"  r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="8"  r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="7"  cy="12" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function LegendIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="4" height="4" rx="1"/><rect x="2" y="9" width="4" height="4" rx="1"/>
      <line x1="9" y1="5" x2="14" y2="5"/><line x1="9" y1="11" x2="14" y2="11"/>
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M13.5 8A5.5 5.5 0 1 1 10 3.07"/><polyline points="10,1 10,4 13,4"/>
    </svg>
  );
}