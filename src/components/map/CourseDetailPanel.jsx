// src/components/map/CourseDetailPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// REVISED:
// - Light & Dark mode now reads from .map-page-root[data-dark] instead of
//   prefers-color-scheme or class-based detection — so it always matches
//   the app's actual theme state.
// - Wider panel, richer sections, smooth animation, mobile bottom sheet.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

// ── Year-level accent colors ──────────────────────────────────────────────────
const YEAR_ACCENT_LIGHT = {
  1: { border: '#3b82f6', bg: '#dbeafe', text: '#1e3a8a', light: '#bfdbfe' },
  2: { border: '#22c55e', bg: '#dcfce7', text: '#14532d', light: '#bbf7d0' },
  3: { border: '#eab308', bg: '#fef9c3', text: '#713f12', light: '#fef08a' },
  4: { border: '#a855f7', bg: '#f3e8ff', text: '#581c87', light: '#e9d5ff' },
};

const YEAR_ACCENT_DARK = {
  1: { border: '#60a5fa', bg: 'rgba(59,130,246,0.18)',  text: '#93c5fd', light: 'rgba(59,130,246,0.3)' },
  2: { border: '#4ade80', bg: 'rgba(34,197,94,0.16)',   text: '#86efac', light: 'rgba(34,197,94,0.28)' },
  3: { border: '#facc15', bg: 'rgba(234,179,8,0.15)',   text: '#fde047', light: 'rgba(234,179,8,0.26)' },
  4: { border: '#c084fc', bg: 'rgba(168,85,247,0.16)',  text: '#d8b4fe', light: 'rgba(168,85,247,0.26)' },
};

function useIsDark() {
  const [dark, setDark] = useState(() => {
    const root = document.querySelector('.map-page-root');
    return root?.dataset?.dark === 'true';
  });

  useEffect(() => {
    const root = document.querySelector('.map-page-root');
    if (!root) return;
    const observer = new MutationObserver(() => {
      setDark(root.dataset.dark === 'true');
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-dark'] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

export default function CourseDetailPanel({ course, onClose }) {
  const isDark = useIsDark();

  if (!course) return null;

  const {
    courseCode,
    courseTitle,
    units,
    yearLevel,
    semester,
    department,
    prerequisites = [],
    skillsLearned = [],
    knowledgeBuilt,
    description,
    learningOutcomes = [],
  } = course;

  const YEAR_ACCENT = isDark ? YEAR_ACCENT_DARK : YEAR_ACCENT_LIGHT;
  const accent = YEAR_ACCENT[yearLevel] ?? YEAR_ACCENT[1];

  // ── Theme tokens ─────────────────────────────────────────────────────────
  const panelBg     = isDark ? '#1e293b' : '#ffffff';
  const borderColor = accent.border;
  const titleColor  = isDark ? '#f1f5f9' : '#111827';
  const subtitleClr = isDark ? '#94a3b8' : '#6b7280';
  const headBorder  = isDark ? '#334155' : '#f3f4f6';
  const sectionHdg  = isDark ? '#475569' : '#9ca3af';
  const descColor   = isDark ? '#94a3b8' : '#4b5563';
  const cardBg      = isDark ? '#0f172a' : '#f9fafb';
  const cardBorder  = isDark ? '#334155' : '#f3f4f6';
  const cardLbl     = isDark ? '#475569' : '#9ca3af';
  const cardVal     = isDark ? '#e2e8f0' : '#111827';
  const prereqBg    = isDark ? '#0f172a' : '#f3f4f6';
  const prereqClr   = isDark ? '#cbd5e1' : '#374151';
  const prereqBdr   = isDark ? '#334155' : '#e5e7eb';
  const skillBg     = isDark ? '#1e3a5f' : '#dbeafe';
  const skillClr    = isDark ? '#93c5fd' : '#1d4ed8';
  const skillBdr    = isDark ? '#2563eb' : '#bfdbfe';
  const knwBg       = isDark ? '#0f172a' : '#f9fafb';
  const knwBdr      = isDark ? '#1e293b' : '#f3f4f6';
  const knwClr      = isDark ? '#94a3b8' : '#4b5563';
  const outcomeClr  = isDark ? '#94a3b8' : '#4b5563';

  const semLabel = (s) => {
    if (s === '1') return 'Semester 1';
    if (s === '2') return 'Semester 2';
    return s ?? '—';
  };

  return (
    <>
      <style>{`
        .cdp-panel {
          font-family: 'DM Sans', 'Inter', sans-serif;
        }

        /* Mobile bottom sheet */
        .cdp-backdrop { display: none; }

        @media (max-width: 767px) {
          .cdp-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.45);
            z-index: 48;
          }
          .cdp-panel {
            position: fixed !important;
            top: auto !important;
            right: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-height: 75vh !important;
            border-left: none !important;
            border-right: none !important;
            border-top: 3px solid ${borderColor} !important;
            border-radius: 18px 18px 0 0 !important;
            animation: cdpSlideUp 0.24s cubic-bezier(0.34,1.56,0.64,1) !important;
          }
          @keyframes cdpSlideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        }

        @media (min-width: 768px) {
          .cdp-panel {
            animation: cdpSlideIn 0.2s ease;
          }
          @keyframes cdpSlideIn {
            from { transform: translateX(14px); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        }

        /* Drag handle (mobile only) */
        .cdp-drag-handle {
          display: flex;
          justify-content: center;
          padding: 10px 0 4px;
        }
        @media (min-width: 768px) {
          .cdp-drag-handle { display: none; }
        }
      `}</style>

      {/* Backdrop (mobile) */}
      <div className="cdp-backdrop" onClick={onClose} />

      {/* Panel */}
      <div
        className="cdp-panel"
        style={{
          position:      'absolute',
          top:           0,
          right:         0,
          height:        '100%',
          width:         '320px',
          background:    panelBg,
          borderLeft:    `3px solid ${borderColor}`,
          boxShadow:     isDark
                           ? '-4px 0 32px rgba(0,0,0,0.5)'
                           : '-4px 0 32px rgba(0,0,0,0.10)',
          zIndex:        50,
          display:       'flex',
          flexDirection: 'column',
          overflowX:     'hidden',
          transition:    'background 0.2s',
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="cdp-drag-handle">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: isDark ? '#334155' : '#d1d5db' }} />
        </div>

        {/* ── Header ── */}
        <div style={{
          display:        'flex',
          alignItems:     'flex-start',
          justifyContent: 'space-between',
          padding:        '13px 15px 11px',
          borderBottom:   `1px solid ${headBorder}`,
          flexShrink:     0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin:        '0 0 3px',
              fontSize:      '9px',
              fontWeight:    700,
              textTransform: 'uppercase',
              letterSpacing: '0.9px',
              color:         sectionHdg,
            }}>
              COURSE DETAILS
            </p>
            <h2 style={{
              margin:        0,
              fontSize:      '19px',
              fontWeight:    800,
              color:         titleColor,
              lineHeight:    1.15,
              fontFamily:    "'DM Mono', 'Fira Code', monospace",
              letterSpacing: '0.2px',
            }}>
              {courseCode}
            </h2>
            <p style={{ margin: '5px 0 0', fontSize: '12.5px', color: subtitleClr, lineHeight: 1.5 }}>
              {courseTitle}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0, marginLeft: 8 }}>
            {/* Year badge */}
            <span style={{
              fontSize:     '10.5px',
              fontWeight:   700,
              padding:      '3px 10px',
              borderRadius: '999px',
              background:   accent.bg,
              color:        accent.text,
              border:       `1.5px solid ${accent.light}`,
              fontFamily:   "'DM Mono', monospace",
              whiteSpace:   'nowrap',
            }}>
              Year {yearLevel}
            </span>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border:     'none',
                color:      isDark ? '#475569' : '#d1d5db',
                fontSize:   22,
                lineHeight: 1,
                cursor:     'pointer',
                padding:    '0 2px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = isDark ? '#94a3b8' : '#9ca3af'}
              onMouseLeave={e => e.currentTarget.style.color = isDark ? '#475569' : '#d1d5db'}
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Body (scrollable) ── */}
        <div style={{
          flex:                   1,
          overflowY:              'auto',
          padding:                '15px',
          display:                'flex',
          flexDirection:          'column',
          gap:                    '18px',
          WebkitOverflowScrolling:'touch',
        }}>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Units',      value: units != null ? `${units} ${units === 1 ? 'unit' : 'units'}` : '—' },
              { label: 'Year Level', value: `Year ${yearLevel}` },
              { label: 'Semester',   value: semLabel(semester) },
              { label: 'Department', value: department ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background:   cardBg,
                borderRadius: '10px',
                padding:      '9px 11px',
                border:       `1px solid ${cardBorder}`,
              }}>
                <p style={{
                  margin:        0,
                  fontSize:      '9px',
                  color:         cardLbl,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight:    700,
                }}>
                  {label}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '12.5px', fontWeight: 600, color: cardVal, lineHeight: 1.3 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          {description && (
            <div>
              <h3 style={{ margin: '0 0 7px', fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: sectionHdg }}>
                Description
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: descColor, lineHeight: 1.65 }}>
                {description}
              </p>
            </div>
          )}

          {/* Prerequisites */}
          <div>
            <h3 style={{ margin: '0 0 7px', fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: sectionHdg }}>
              Prerequisites
            </h3>
            {prerequisites.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12.5px', color: isDark ? '#475569' : '#9ca3af', fontStyle: 'italic' }}>
                None required
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {prerequisites.map(pre => (
                  <span key={pre} style={{
                    display:     'inline-block',
                    fontSize:    '11px',
                    fontWeight:  600,
                    padding:     '3px 9px',
                    borderRadius:'6px',
                    background:  prereqBg,
                    color:       prereqClr,
                    border:      `1px solid ${prereqBdr}`,
                    fontFamily:  "'DM Mono', 'Fira Code', monospace",
                  }}>
                    {pre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Skills Learned */}
          {skillsLearned.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 7px', fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: sectionHdg }}>
                Skills Learned
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {skillsLearned.map(skill => (
                  <span key={skill} style={{
                    display:     'inline-block',
                    fontSize:    '11.5px',
                    fontWeight:  500,
                    padding:     '3px 9px',
                    borderRadius:'6px',
                    background:  skillBg,
                    color:       skillClr,
                    border:      `1px solid ${skillBdr}`,
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Outcomes */}
          {learningOutcomes.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 7px', fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: sectionHdg }}>
                Learning Outcomes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {learningOutcomes.map((outcome, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12.5px', color: outcomeClr, lineHeight: 1.55 }}>
                    <span style={{
                      width:      5,
                      height:     5,
                      borderRadius:'50%',
                      background: accent.border,
                      flexShrink: 0,
                      marginTop:  6,
                    }} />
                    {outcome}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Built */}
          {knowledgeBuilt && (
            <div>
              <h3 style={{ margin: '0 0 7px', fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: sectionHdg }}>
                Knowledge Built
              </h3>
              <p style={{
                margin:       0,
                fontSize:     '12.5px',
                color:        knwClr,
                lineHeight:   1.65,
                background:   knwBg,
                borderRadius: '10px',
                padding:      '10px 12px',
                border:       `1px solid ${knwBdr}`,
              }}>
                {Array.isArray(knowledgeBuilt) ? knowledgeBuilt.join(', ') : knowledgeBuilt}
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}