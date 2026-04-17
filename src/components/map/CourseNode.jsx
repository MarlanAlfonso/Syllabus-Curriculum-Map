import { Handle, Position } from '@xyflow/react';

const yearLevelStyles = {
  1: { background: '#dbeafe', border: '2px solid #60a5fa', color: '#1e40af' },
  2: { background: '#dcfce7', border: '2px solid #4ade80', color: '#166534' },
  3: { background: '#fef9c3', border: '2px solid #facc15', color: '#854d0e' },
  4: { background: '#f3e8ff', border: '2px solid #c084fc', color: '#6b21a8' },
};

const yearLevelBadge = {
  1: { background: '#bfdbfe', color: '#1d4ed8' },
  2: { background: '#bbf7d0', color: '#15803d' },
  3: { background: '#fef08a', color: '#a16207' },
  4: { background: '#e9d5ff', color: '#7e22ce' },
};

export default function CourseNode({ data }) {
  const { courseCode, courseTitle, yearLevel, isIsolated } = data;

  const colorStyle = yearLevelStyles[yearLevel] || {
    background: '#f1f5f9',
    border: '2px solid #94a3b8',
    color: '#334155',
  };

  const badgeStyle = yearLevelBadge[yearLevel] || {
    background: '#e2e8f0',
    color: '#475569',
  };

  const nodeStyle = isIsolated
    ? {
        background: '#ffffff',
        border: '2px dashed #9ca3af',
        color: '#374151',
        borderRadius: '10px',
        padding: '10px 12px',
        width: '176px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        textAlign: 'left',
      }
    : {
        ...colorStyle,
        borderRadius: '10px',
        padding: '10px 12px',
        width: '176px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        textAlign: 'left',
      };

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} />

      {/* Course Code + Year Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontWeight: '700', fontSize: '13px' }}>{courseCode}</span>
        <span style={{
          fontSize: '11px',
          fontWeight: '600',
          padding: '2px 7px',
          borderRadius: '999px',
          ...badgeStyle,
        }}>
          Y{yearLevel}
        </span>
      </div>

      {/* Course Title */}
      <p style={{
        margin: 0,
        fontSize: '11px',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {courseTitle}
      </p>

      {/* Isolated Badge */}
      {isIsolated && (
        <span style={{
          marginTop: '6px',
          display: 'inline-block',
          fontSize: '10px',
          fontWeight: '500',
          color: '#6b7280',
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          padding: '2px 6px',
        }}>
          Foundational
        </span>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}