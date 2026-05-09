// src/components/map/CourseNode.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Reads dark mode from .map-page-root[data-dark].
// Strong info hierarchy: code (largest) → title → chips (smallest).
// Isolated nodes get a dashed border + ◇ Foundational badge.
// ─────────────────────────────────────────────────────────────────────────────

import { Handle, Position } from '@xyflow/react';
import '../../styles/CurriculumMapPage.css';

const YEAR_LIGHT = {
  1: { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a8a', badge: '#bfdbfe', badgeText: '#1d4ed8' },
  2: { bg: '#dcfce7', border: '#22c55e', text: '#14532d', badge: '#bbf7d0', badgeText: '#15803d' },
  3: { bg: '#fef9c3', border: '#eab308', text: '#713f12', badge: '#fef08a', badgeText: '#a16207' },
  4: { bg: '#f3e8ff', border: '#a855f7', text: '#581c87', badge: '#e9d5ff', badgeText: '#7e22ce' },
};

const YEAR_DARK = {
  1: { bg: 'rgba(59,130,246,0.18)',  border: '#60a5fa', text: '#bfdbfe', badge: 'rgba(59,130,246,0.28)',  badgeText: '#93c5fd' },
  2: { bg: 'rgba(34,197,94,0.16)',   border: '#4ade80', text: '#bbf7d0', badge: 'rgba(34,197,94,0.26)',   badgeText: '#86efac' },
  3: { bg: 'rgba(234,179,8,0.15)',   border: '#facc15', text: '#fef08a', badge: 'rgba(234,179,8,0.25)',   badgeText: '#fde047' },
  4: { bg: 'rgba(168,85,247,0.16)',  border: '#c084fc', text: '#e9d5ff', badge: 'rgba(168,85,247,0.26)',  badgeText: '#d8b4fe' },
};

const SEM_LABEL = { '1': 'Sem 1', '2': 'Sem 2', 'Summer': 'Summer' };

function isDarkMode() {
  if (typeof document === 'undefined') return false;
  return document.querySelector('.map-page-root')?.dataset?.dark === 'true';
}

export default function CourseNode({ data, selected }) {
  const { courseCode, courseTitle, yearLevel, semester, units, isIsolated, dimmed } = data;
  const dark    = isDarkMode();
  const palette = dark ? YEAR_DARK : YEAR_LIGHT;
  const colors  = palette[yearLevel] ?? palette[1];

  const nodeBorder = isIsolated ? (dark ? '#334155' : '#d1d5db') : colors.border;
  const nodeBg     = isIsolated ? (dark ? 'rgba(255,255,255,0.03)' : '#fafafa') : colors.bg;
  const codeColor  = isIsolated ? (dark ? '#94a3b8' : '#374151') : colors.text;
  const titleColor = dark
    ? (isIsolated ? '#64748b' : colors.text)
    : (isIsolated ? '#6b7280' : '#374151');
  const metaColor  = dark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
  const handleColor = isIsolated ? (dark ? '#475569' : '#9ca3af') : colors.border;
  const handleRing  = dark ? '#0f172a' : '#ffffff';

  return (
    <div
      className="course-node-hover"
      style={{
        background:   nodeBg,
        border:       `1.5px ${isIsolated ? 'dashed' : 'solid'} ${nodeBorder}`,
        borderRadius: '10px',
        padding:      '10px 12px 9px',
        width:        '192px',
        boxSizing:    'border-box',
        textAlign:    'left',
        position:     'relative',
        opacity:      dimmed ? 0.15 : 1,
        transition:   'opacity 0.2s ease, box-shadow 0.15s ease',
        boxShadow:    selected
          ? `0 0 0 2.5px ${nodeBorder}, 0 4px 16px rgba(0,0,0,0.18)`
          : dark
            ? '0 2px 8px rgba(0,0,0,0.4)'
            : '0 1px 4px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Target handle — prerequisites enter from top */}
      <Handle type="target" position={Position.Top} style={{
        width: 10, height: 10,
        background: handleColor,
        border: `2px solid ${handleRing}`,
        top: -6,
      }} />

      {/* Row 1: course code + year badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 5 }}>
        <span style={{
          fontFamily:   "'DM Mono','Fira Code','Courier New',monospace",
          fontWeight:   800,
          fontSize:     '13px',
          color:        codeColor,
          letterSpacing:'0.4px',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
          flex:         1,
          minWidth:     0,
        }}>
          {courseCode}
        </span>
        <span style={{
          fontSize:     '9.5px',
          fontWeight:   700,
          padding:      '2px 6px',
          borderRadius: '999px',
          background:   isIsolated ? (dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6') : colors.badge,
          color:        isIsolated ? (dark ? '#475569' : '#9ca3af') : colors.badgeText,
          whiteSpace:   'nowrap',
          flexShrink:   0,
          fontFamily:   "'DM Mono',monospace",
        }}>
          Y{yearLevel}
        </span>
      </div>

      {/* Row 2: title */}
      <p style={{
        margin:            0,
        fontSize:          '11px',
        fontWeight:        500,
        lineHeight:        1.4,
        color:             titleColor,
        display:           '-webkit-box',
        WebkitLineClamp:   2,
        WebkitBoxOrient:   'vertical',
        overflow:          'hidden',
        marginBottom:      6,
      }}>
        {courseTitle}
      </p>

      {/* Row 3: chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
        {units != null && (
          <span style={{
            fontSize: '9.5px', fontWeight: 500, color: metaColor,
            background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            borderRadius: '4px', padding: '1.5px 5px',
          }}>
            {units} {units === 1 ? 'unit' : 'units'}
          </span>
        )}
        {semester && (
          <span style={{
            fontSize: '9.5px', fontWeight: 500, color: metaColor,
            background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            borderRadius: '4px', padding: '1.5px 5px',
          }}>
            {SEM_LABEL[semester] ?? semester}
          </span>
        )}
        {isIsolated && (
          <span style={{
            fontSize: '9px', fontWeight: 700,
            color:    dark ? '#475569' : '#9ca3af',
            background: dark ? 'rgba(255,255,255,0.04)' : '#f3f4f6',
            border:   `1px dashed ${dark ? '#334155' : '#d1d5db'}`,
            borderRadius: '4px', padding: '1.5px 6px', letterSpacing: '0.3px',
          }}>
            ◇ Foundational
          </span>
        )}
      </div>

      {/* Source handle — this node is a prereq for others */}
      <Handle type="source" position={Position.Bottom} style={{
        width: 10, height: 10,
        background: handleColor,
        border: `2px solid ${handleRing}`,
        bottom: -6,
      }} />
    </div>
  );
}