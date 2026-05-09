// src/components/map/SwimlaneNode.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Now renders a left-side row label chip for each Year × Semester row.
// Registered as nodeType "rowLabelNode" in CurriculumMapPage.jsx.
//
// Receives from graphDataBuilder:
//   data.year    — 1 | 2 | 3 | 4
//   data.sem     — '1' | '2' | 'Summer'
//   data.colors  — { edge, bg, border, text, label } from YEAR_COLORS
//
// The node's position.x is 0 (left edge of graph).
// It is draggable:false, selectable:false — purely decorative.
// ─────────────────────────────────────────────────────────────────────────────

import { YEAR_COLORS, YEAR_COLORS_DARK, NODE_H } from '../../utils/graphDataBuilder';

function isDarkMode() {
  if (typeof document === 'undefined') return false;
  return document.querySelector('.map-page-root')?.dataset?.dark === 'true';
}

function semLabel(sem) {
  if (sem === '1') return 'S1';
  if (sem === '2') return 'S2';
  return 'Sum';
}

export default function SwimlaneNode({ data }) {
  const { year, sem } = data;
  const dark   = isDarkMode();
  const yc     = (dark ? YEAR_COLORS_DARK : YEAR_COLORS)[year] ?? YEAR_COLORS[1];

  // Pill height matches the course node height
  return (
    <div
      style={{
        width:          '80px',
        height:         `${NODE_H}px`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        pointerEvents:  'none',
        userSelect:     'none',
      }}
    >
      <div
        style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '3px',
          padding:        '6px 10px',
          borderRadius:   '10px',
          background:     dark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.92)',
          border:         `2px solid ${yc.border}`,
          boxShadow:      dark
            ? `0 0 0 1px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.4)`
            : `0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px ${yc.border}22`,
          backdropFilter: 'blur(6px)',
          minWidth:       '62px',
        }}
      >
        {/* Year badge */}
        <span
          style={{
            display:        'inline-flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '9.5px',
            fontWeight:     800,
            letterSpacing:  '0.5px',
            fontFamily:     "'DM Mono','Fira Code','Courier New',monospace",
            color:          yc.text,
            background:     yc.bg,
            border:         `1.5px solid ${yc.border}`,
            borderRadius:   '6px',
            padding:        '1px 6px',
            whiteSpace:     'nowrap',
            lineHeight:     1.6,
          }}
        >
          Y{year}
        </span>

        {/* Semester label */}
        <span
          style={{
            fontSize:      '10.5px',
            fontWeight:    700,
            color:         yc.text,
            fontFamily:    "'DM Sans','Inter',sans-serif",
            whiteSpace:    'nowrap',
            opacity:       0.85,
            lineHeight:    1,
          }}
        >
          {semLabel(sem)}
        </span>
      </div>
    </div>
  );
}