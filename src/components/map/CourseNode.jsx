import { Handle, Position } from '@xyflow/react';

const yearLevelStyles = {
  1: 'bg-blue-100 border-blue-400 text-blue-800',
  2: 'bg-green-100 border-green-400 text-green-800',
  3: 'bg-amber-100 border-amber-400 text-amber-800',
  4: 'bg-purple-100 border-purple-400 text-purple-800',
};

const yearLevelBadge = {
  1: 'bg-blue-200 text-blue-700',
  2: 'bg-green-200 text-green-700',
  3: 'bg-amber-200 text-amber-700',
  4: 'bg-purple-200 text-purple-700',
};

export default function CourseNode({ data }) {
  const { courseCode, courseTitle, yearLevel, isIsolated } = data;
  const colorClass = yearLevelStyles[yearLevel] || 'bg-gray-100 border-gray-400 text-gray-800';
  const badgeClass = yearLevelBadge[yearLevel] || 'bg-gray-200 text-gray-700';

  return (
    <div
      className={`rounded-lg border-2 px-3 py-2 w-44 shadow-sm text-left
        ${isIsolated ? 'border-dashed border-gray-400 bg-white' : colorClass}
      `}
    >
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-sm">{courseCode}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${badgeClass}`}>
          Y{yearLevel}
        </span>
      </div>

      <p className="text-xs leading-tight line-clamp-2">{courseTitle}</p>

      {isIsolated && (
        <span className="mt-1 inline-block text-xs bg-gray-100 text-gray-500 border border-gray-300 rounded px-1.5 py-0.5">
          Foundational
        </span>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}