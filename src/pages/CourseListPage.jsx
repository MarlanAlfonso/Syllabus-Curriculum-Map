// src/pages/CourseListPage.jsx
// CHANGES:
// - Only superadmins see the Archive button. Admins can Restore (from disabled tab) but not Archive.
// - Disabled tab is hidden for regular users (visible only to admins and superadmins).
// - All other functionality unchanged.

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import AddCourseModal from '../components/AddCourseModal';
import EditCourseModal from '../components/EditCourseModal';
import SoftDisableConfirmDialog from '../components/SoftDisableConfirmDialog';
import { getCourses, getDisabledCourses, enableCourse } from '../services/courseService';
import { useAuth } from '../context/useAuth';
import { exportToCSV, formatYearSemester } from '../utils/courseUtils';

const yearColors = {
  1: { bg: '#e0f2fe', text: '#0369a1', dot: '#38bdf8', darkBg: '#0c2d48', darkText: '#7dd3fc' },
  2: { bg: '#dcfce7', text: '#15803d', dot: '#4ade80', darkBg: '#0a2e1a', darkText: '#86efac' },
  3: { bg: '#fef3c7', text: '#b45309', dot: '#fbbf24', darkBg: '#2d1f00', darkText: '#fcd34d' },
  4: { bg: '#ede9fe', text: '#6d28d9', dot: '#a78bfa', darkBg: '#1e1040', darkText: '#c4b5fd' },
};

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)', background: '#111827', color: '#fff',
          fontSize: 11, fontWeight: 500, padding: '4px 8px', borderRadius: 6,
          whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 200,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          {text}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
            borderTop: '4px solid #111827',
          }} />
        </div>
      )}
    </div>
  );
}

function FilterDropdown({ label, value, options, onChange, dark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const isActive = value !== 'All';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 12px', borderRadius: 9,
        border: isActive ? '1.5px solid #1d4ed8' : `1px solid ${dark ? '#374151' : '#e5e7eb'}`,
        background: isActive ? (dark ? '#1e3a5f' : '#eff6ff') : (dark ? '#1f2937' : '#fff'),
        color: isActive ? (dark ? '#93c5fd' : '#1d4ed8') : (dark ? '#d1d5db' : '#374151'),
        fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
        whiteSpace: 'nowrap', transition: 'all 0.15s',
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: isActive ? '#93c5fd' : (dark ? '#6b7280' : '#9ca3af') }}>
          {label}
        </span>
        <span>{selected?.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 2 }}>
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
          background: dark ? '#1f2937' : '#fff',
          border: `1px solid ${dark ? '#374151' : '#e5e7eb'}`,
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          minWidth: 170, overflow: 'hidden', animation: 'dropIn 0.15s ease',
        }}>
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '9px 14px',
              background: opt.value === value ? (dark ? '#1e3a5f' : '#eff6ff') : 'transparent',
              color: opt.value === value ? (dark ? '#93c5fd' : '#1d4ed8') : (dark ? '#d1d5db' : '#374151'),
              border: 'none', fontSize: 13,
              fontWeight: opt.value === value ? 600 : 400,
              fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
            }}
              onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = dark ? '#111827' : '#f8fafc'; }}
              onMouseLeave={e => { if (opt.value !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              {opt.label}
              {opt.value === value && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke={dark ? '#93c5fd' : '#1d4ed8'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function KnowledgeDrawer({ course, onClose, dark }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!course) return null;

  const skills = Array.isArray(course.skillsLearned)
    ? course.skillsLearned
    : (course.skillsLearned || '').split(',').map(s => s.trim()).filter(Boolean);

  const yc = yearColors[course.yearLevel] || yearColors[1];

  return createPortal(
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        zIndex: 9998, animation: 'fadeIn 0.2s ease',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 360,
        background: dark ? '#111827' : '#fff',
        borderLeft: `3px solid #1d4ed8`,
        boxShadow: '-6px 0 32px rgba(0,0,0,0.18)',
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        animation: 'drawerIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${dark ? '#1f2937' : '#e5e7eb'}`,
          flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#6b7280', margin: '0 0 4px' }}>
              Knowledge Details
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'DM Mono','Fira Code',monospace", fontSize: 15, fontWeight: 700, color: dark ? '#f9fafb' : '#111827' }}>
                {course.courseCode}
              </span>
              <span style={{
                padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: dark ? yc.darkBg : yc.bg, color: dark ? yc.darkText : yc.text,
              }}>
                Y{course.yearLevel}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: dark ? '#9ca3af' : '#6b7280', lineHeight: 1.4 }}>
              {course.courseTitle}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 7, border: `1px solid ${dark ? '#374151' : '#e5e7eb'}`,
            background: dark ? '#1f2937' : '#f9fafb', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginLeft: 10,
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2l6 6M8 2l-6 6" stroke={dark ? '#9ca3af' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Units', value: course.units },
              { label: 'Semester', value: formatYearSemester(course.yearLevel, course.semester) },
              { label: 'Department', value: course.department || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: dark ? '#1f2937' : '#f8fafc',
                border: `1px solid ${dark ? '#374151' : '#f3f4f6'}`,
                borderRadius: 9, padding: '8px 12px',
              }}>
                <p style={{ margin: 0, fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>{label}</p>
                <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 600, color: dark ? '#f9fafb' : '#111827' }}>{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.07em' }}>Prerequisites</p>
            {course.prerequisites?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {course.prerequisites.map(p => (
                  <span key={p} style={{
                    fontFamily: "'DM Mono','Fira Code',monospace",
                    fontSize: 11, padding: '3px 9px', borderRadius: 6,
                    background: dark ? '#1e3a5f' : '#eff6ff',
                    color: dark ? '#93c5fd' : '#1d4ed8',
                    border: `1px solid ${dark ? '#1d4ed8' : '#bfdbfe'}`,
                    fontWeight: 600,
                  }}>{p}</span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>No prerequisites</p>
            )}
          </div>

          <div style={{ background: dark ? '#0a2e1a' : '#f0fdf4', border: `1px solid ${dark ? '#166534' : '#bbf7d0'}`, borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: dark ? '#4ade80' : '#15803d', margin: '0 0 8px' }}>Skills Learned</p>
            {skills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {skills.map((skill, i) => (
                  <span key={i} style={{
                    padding: '3px 10px', borderRadius: 999,
                    background: dark ? '#14532d' : '#dcfce7',
                    color: dark ? '#86efac' : '#15803d',
                    fontSize: 11, fontWeight: 600,
                    border: `1px solid ${dark ? '#166534' : '#bbf7d0'}`,
                  }}>{skill}</span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>No skills listed</p>
            )}
          </div>

          <div style={{ background: dark ? '#0c1e3d' : '#eff6ff', border: `1px solid ${dark ? '#1e40af' : '#bfdbfe'}`, borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: dark ? '#93c5fd' : '#1d4ed8', margin: '0 0 8px' }}>Knowledge Built</p>
            {course.knowledgeBuilt ? (
              <p style={{ fontSize: 12, color: dark ? '#bfdbfe' : '#1e40af', lineHeight: 1.65, margin: 0 }}>
                {Array.isArray(course.knowledgeBuilt) ? course.knowledgeBuilt.join(', ') : course.knowledgeBuilt}
              </p>
            ) : (
              <p style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>No description provided</p>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function CourseListPage() {
  const { role } = useAuth();

  // ── ROLE CHECKS ──────────────────────────────────────────────────────────
  const isSuperAdmin = role === 'superadmin';
  const isAdmin      = role === 'admin';
  const canWrite     = isSuperAdmin || isAdmin;           // add/edit/detail
  const canArchive   = isSuperAdmin;                      // only superadmin can archive
  const canRestore   = isSuperAdmin || isAdmin;           // admin & superadmin can restore
  const canSeeDisabledTab = isSuperAdmin || isAdmin;      // regular users should NOT see archived tab

  const [courses, setCourses] = useState([]);
  const [disabledCourses, setDisabledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [disablingCourse, setDisablingCourse] = useState(null);
  const [drawerCourse, setDrawerCourse] = useState(null);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('All');
  const [filterSem, setFilterSem] = useState('All');
  const [filterPrereq, setFilterPrereq] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [visible, setVisible] = useState(false);

  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true); setError(null);
      const [active, disabled] = await Promise.all([
        getCourses(),
        getDisabledCourses().catch(() => []),
      ]);
      setCourses(active);
      setDisabledCourses(disabled);
      setTimeout(() => setVisible(true), 60);
    } catch {
      setError('Failed to load courses. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseAdded    = () => fetchAll();
  const handleCourseUpdated  = () => fetchAll();
  const handleCourseDisabled = () => { setDisablingCourse(null); fetchAll(); };
  const handleEnable         = async (course) => {
    try { await enableCourse(course.id); fetchAll(); } catch { /* silent */ }
  };

  const sourceList = activeTab === 'active' ? courses : disabledCourses;

  const filtered = sourceList.filter(c => {
    const matchSearch  = c.courseCode?.toLowerCase().includes(search.toLowerCase()) || c.courseTitle?.toLowerCase().includes(search.toLowerCase());
    const matchYear    = filterYear   === 'All' || String(c.yearLevel) === filterYear;
    const matchSem     = filterSem    === 'All' || String(c.semester)  === filterSem;
    const matchPrereq  =
      filterPrereq === 'All'  ? true :
      filterPrereq === 'with' ? c.prerequisites?.length > 0 :
                                (!c.prerequisites || c.prerequisites.length === 0);
    return matchSearch && matchYear && matchSem && matchPrereq;
  }).sort((a, b) => {
    if (sortBy === 'title') return a.courseTitle?.localeCompare(b.courseTitle);
    if (sortBy === 'code')  return a.courseCode?.localeCompare(b.courseCode);
    if (sortBy === 'units') return b.units - a.units;
    const semOrder = { '1': 0, '2': 1, 'Summer': 2 };
    if (a.yearLevel !== b.yearLevel) return a.yearLevel - b.yearLevel;
    return (semOrder[String(a.semester)] ?? 9) - (semOrder[String(b.semester)] ?? 9);
  });

  const activeFilters = (filterYear !== 'All' ? 1 : 0) + (filterSem !== 'All' ? 1 : 0) + (filterPrereq !== 'All' ? 1 : 0);
  const clearFilters  = () => { setFilterYear('All'); setFilterSem('All'); setFilterPrereq('All'); setSearch(''); setSortBy('default'); };

  const yearOptions  = [{ value: 'All', label: 'All years' }, { value: '1', label: 'Year 1' }, { value: '2', label: 'Year 2' }, { value: '3', label: 'Year 3' }, { value: '4', label: 'Year 4' }];
  const semOptions   = [{ value: 'All', label: 'All semesters' }, { value: '1', label: 'Semester 1' }, { value: '2', label: 'Semester 2' }, { value: 'Summer', label: 'Summer' }];
  const prereqOptions= [{ value: 'All', label: 'All courses' }, { value: 'with', label: 'With prerequisites' }, { value: 'none', label: 'No prerequisites' }];
  const sortOptions  = [{ value: 'default', label: 'Year → Semester' }, { value: 'title', label: 'Title (A–Z)' }, { value: 'code', label: 'Code (A–Z)' }, { value: 'units', label: 'Units (High–Low)' }];

  const bg           = dark ? '#0f172a' : '#f9fafb';
  const cardBg       = dark ? '#111827' : '#fff';
  const border       = dark ? '#1f2937' : '#e5e7eb';
  const textPrimary  = dark ? '#f9fafb' : '#111827';
  const textSecondary= dark ? '#9ca3af' : '#6b7280';
  const tableHeaderBg= dark ? '#1a2234' : '#f8fafc';
  const rowHover     = dark ? '#1a2234' : '#f8fafc';
  const filterBg     = dark ? '#161f2e' : '#fafafa';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: `2px solid ${dark ? '#1f2937' : '#dbeafe'}`, borderTop: '2px solid #2563eb', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 13, color: textSecondary, fontFamily: "'DM Sans',system-ui,sans-serif" }}>Loading courses…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 12, padding: 24, maxWidth: 400, fontSize: 13, textAlign: 'center' }}>{error}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes dropIn   { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes drawerIn { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .cl-row { transition: background 0.12s; }
        .cl-row:hover { background: ${rowHover} !important; }
        .cl-icon-btn { width:30px;height:30px;border-radius:8px;border:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;flex-shrink:0; }
        .cl-icon-btn:hover { transform:translateY(-1px); }
        .anim-in { animation: fadeUp 0.4s ease both; }
        .search-wrap { display:flex;align-items:center;gap:8px;border-radius:10px;padding:0 12px;height:38px;width:220px;transition:border-color 0.2s,box-shadow 0.2s; }
        .search-wrap:focus-within { box-shadow:0 0 0 3px rgba(147,197,253,0.2); }
        .search-wrap input { border:none;outline:none;font-size:13px;background:transparent;width:100%;font-family:inherit; }
      `}</style>

      {/* ── Page header ── */}
      <div className="anim-in" style={{ animationDelay: '0.03s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#2563eb', margin: '0 0 4px' }}>Curriculum Management</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Courses</h1>
            <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: dark ? '#1f2937' : '#f3f4f6', color: textSecondary }}>
              {courses.length} active
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="search-wrap" style={{ background: cardBg, border: `1px solid ${border}`, color: textPrimary }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke={textSecondary} strokeWidth="1.4"/>
              <path d="M11.5 11.5l2.5 2.5" stroke={textSecondary} strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} style={{ color: textPrimary }} />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSecondary, padding: 0, display: 'flex' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          <button onClick={() => exportToCSV(filtered, `courses-${activeTab}`)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 10, border: `1px solid ${border}`, background: cardBg,
            color: textSecondary, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
          }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export CSV
          </button>

          {/* Add Course — admin & superadmin */}
          {canWrite && (
            <button onClick={() => setIsAddOpen(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 10, background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
              color: '#fff', border: 'none', fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(37,99,235,0.35)',
            }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add New Course
            </button>
          )}
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="anim-in" style={{ animationDelay: '0.09s', background: cardBg, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>

        {/* Tabs — disabled tab hidden for regular users */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: `1px solid ${border}`, background: dark ? '#161f2e' : '#fafbfc', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {[
              { key: 'active', label: 'Active Courses', count: courses.length, visible: true },
              { key: 'disabled', label: 'Archived', count: disabledCourses.length, visible: canSeeDisabledTab },
            ].filter(tab => tab.visible).map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearch(''); }} style={{
                padding: '13px 16px', background: 'none', border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === tab.key ? '#2563eb' : textSecondary,
                fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7, marginBottom: -1,
              }}>
                {tab.label}
                <span style={{ padding: '1px 7px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: activeTab === tab.key ? (dark ? '#1e3a5f' : '#dbeafe') : (dark ? '#1f2937' : '#f3f4f6'), color: activeTab === tab.key ? '#2563eb' : textSecondary }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Role notice */}
          {isAdmin && !isSuperAdmin && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, background: dark ? '#292000' : '#fefce8', border: `1px solid ${dark ? '#854d0e' : '#fde68a'}`, color: dark ? '#fbbf24' : '#92400e', fontSize: 11, fontWeight: 500 }}>
              ✏️ Edit & Restore only — Archive requires Superadmin
            </span>
          )}
          {!canWrite && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, background: dark ? '#292000' : '#fefce8', border: `1px solid ${dark ? '#854d0e' : '#fde68a'}`, color: dark ? '#fbbf24' : '#92400e', fontSize: 11, fontWeight: 500 }}>
              👁️ View only
            </span>
          )}
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '10px 16px', borderBottom: `1px solid ${border}`, background: filterBg }}>
          <FilterDropdown label="Year"          value={filterYear}   options={yearOptions}   onChange={setFilterYear}   dark={dark} />
          <div style={{ width: 1, height: 22, background: border }} />
          <FilterDropdown label="Semester"      value={filterSem}    options={semOptions}    onChange={setFilterSem}    dark={dark} />
          <div style={{ width: 1, height: 22, background: border }} />
          <FilterDropdown label="Prerequisites" value={filterPrereq} options={prereqOptions} onChange={setFilterPrereq} dark={dark} />
          <div style={{ width: 1, height: 22, background: border }} />
          <FilterDropdown label="Sort by"       value={sortBy}       options={sortOptions}   onChange={setSortBy}       dark={dark} />
          {(activeFilters > 0 || search || sortBy !== 'default') && (
            <button onClick={clearFilters} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, background: dark ? '#3b0f14' : '#fee2e2', color: dark ? '#fca5a5' : '#dc2626', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              ✕ Clear
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: textSecondary }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table / Empty */}
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', color: textSecondary }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {search || activeFilters > 0 ? 'No courses match your filters' : activeTab === 'disabled' ? 'No archived courses' : 'No courses yet'}
            </p>
            <p style={{ fontSize: 12, color: dark ? '#4b5563' : '#9ca3af' }}>
              {search || activeFilters > 0 ? 'Try adjusting your search or filters' : canWrite ? 'Click "Add New Course" to get started' : 'No courses have been added yet'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: tableHeaderBg }}>
                  {['Code', 'Title', 'Units', 'Year & Sem', 'Prerequisites', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Units' ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: textSecondary, letterSpacing: '.07em', textTransform: 'uppercase', borderBottom: `1px solid ${border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((course, idx) => {
                  const yc          = yearColors[course.yearLevel] || yearColors[1];
                  const prereqs     = course.prerequisites || [];
                  const isDrawerOpen= drawerCourse?.id === course.id;

                  return (
                    <tr key={course.id} className="cl-row" style={{ borderBottom: `1px solid ${border}`, background: isDrawerOpen ? (dark ? '#0c1e3d' : '#f0f7ff') : 'transparent', animation: `fadeUp 0.3s ease both`, animationDelay: `${idx * 0.03}s` }}>

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <span style={{ fontFamily: "'DM Mono','Fira Code',monospace", fontSize: 12, fontWeight: 600, color: textPrimary, letterSpacing: '0.02em' }}>
                          {course.courseCode}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', maxWidth: 280 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: textPrimary, lineHeight: 1.3 }}>{course.courseTitle}</span>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: textSecondary }}>{course.units}</span>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: dark ? yc.darkBg : yc.bg, color: dark ? yc.darkText : yc.text, whiteSpace: 'nowrap' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dark ? yc.darkText : yc.dot, display: 'inline-block', flexShrink: 0 }} />
                          {formatYearSemester(course.yearLevel, course.semester)}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        {prereqs.length === 0 ? (
                          <span style={{ fontSize: 12, color: dark ? '#4b5563' : '#d1d5db', fontStyle: 'italic' }}>None</span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
                            {prereqs.slice(0, 2).map(p => (
                              <span key={p} style={{ fontFamily: "'DM Mono','Fira Code',monospace", fontSize: 11, padding: '2px 7px', borderRadius: 6, background: dark ? '#1e3a5f' : '#eff6ff', color: dark ? '#93c5fd' : '#1d4ed8', border: `1px solid ${dark ? '#1d4ed8' : '#bfdbfe'}`, fontWeight: 500, whiteSpace: 'nowrap' }}>{p}</span>
                            ))}
                            {prereqs.length > 2 && (
                              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999, background: dark ? '#1f2937' : '#f3f4f6', color: textSecondary, fontWeight: 600 }}>+{prereqs.length - 2}</span>
                            )}
                          </div>
                        )}
                      </td>
                      
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>

                          {/* Details — everyone */}
                          <Tooltip text="Knowledge Details">
                            <button className="cl-icon-btn"
                              onClick={() => setDrawerCourse(isDrawerOpen ? null : course)}
                              style={{ background: isDrawerOpen ? '#1d4ed8' : (dark ? '#1e3a5f' : '#eff6ff'), color: isDrawerOpen ? '#fff' : (dark ? '#93c5fd' : '#1d4ed8'), border: `1px solid ${dark ? '#1d4ed8' : '#bfdbfe'}` }}>
                              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
                                <path d="M7 6v4M7 4.5V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </Tooltip>

                          {/* Edit — admin & superadmin */}
                          {canWrite && activeTab === 'active' && (
                            <Tooltip text="Edit Course">
                              <button className="cl-icon-btn"
                                onClick={() => setEditingCourse(course)}
                                style={{ background: dark ? '#1f2937' : '#f8fafc', color: dark ? '#9ca3af' : '#374151', border: `1px solid ${border}` }}>
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                  <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </Tooltip>
                          )}

                          {/* Archive — SUPERADMIN ONLY (only on active tab) */}
                          {canArchive && activeTab === 'active' && (
                            <Tooltip text="Archive Course">
                              <button className="cl-icon-btn"
                                onClick={() => setDisablingCourse(course)}
                                style={{ background: dark ? '#2d0a14' : '#fff1f2', color: dark ? '#fca5a5' : '#be123c', border: `1px solid ${dark ? '#7f1d1d' : '#fecdd3'}` }}>
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                  <path d="M2 4h10M5 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M6 7v3M8 7v3M3 4l.7 7a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </Tooltip>
                          )}

                          {/* Restore — ADMIN & SUPERADMIN (only on disabled tab) */}
                          {canRestore && activeTab === 'disabled' && (
                            <Tooltip text="Restore Course">
                              <button className="cl-icon-btn"
                                onClick={() => handleEnable(course)}
                                style={{ background: dark ? '#0a2e1a' : '#f0fdf4', color: dark ? '#86efac' : '#15803d', border: `1px solid ${dark ? '#166534' : '#bbf7d0'}` }}>
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                  <path d="M2 7a5 5 0 1 1 1.5 3.6M2 11V7h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="anim-in" style={{ animationDelay: '0.15s', fontSize: 11, color: textSecondary, marginTop: 10, paddingLeft: 2 }}>
          Showing {filtered.length} of {sourceList.length} course{sourceList.length !== 1 ? 's' : ''}
        </p>
      )}

      {drawerCourse && <KnowledgeDrawer course={drawerCourse} onClose={() => setDrawerCourse(null)} dark={dark} />}

      {canWrite && (
        <>
          <AddCourseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onCourseAdded={handleCourseAdded} allCourses={courses} />
          <EditCourseModal isOpen={editingCourse !== null} onClose={() => setEditingCourse(null)} onCourseUpdated={handleCourseUpdated} course={editingCourse} allCourses={courses} />
        </>
      )}

      {/* Archive dialog only shown for superadmin */}
      {canArchive && (
        <SoftDisableConfirmDialog isOpen={disablingCourse !== null} onClose={() => setDisablingCourse(null)} onDisabled={handleCourseDisabled} courseId={disablingCourse?.id} courseCode={disablingCourse?.courseCode} />
      )}
    </div>
  );
}