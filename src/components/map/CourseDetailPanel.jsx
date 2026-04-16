export default function CourseDetailPanel({ course, onClose }) {
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
  } = course;

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l-4 border-blue-400 shadow-xl z-50 flex flex-col transition-transform">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{courseCode}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{courseTitle}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold ml-2"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Units</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{units}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Year Level</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">Year {yearLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Semester</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{semester}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Department</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{department}</span>
          </div>
        </div>

        {/* Prerequisites */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Prerequisites</h3>
          {prerequisites.length === 0 ? (
            <p className="text-sm text-gray-400">None</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {prerequisites.map((pre) => (
                <span key={pre} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5">
                  {pre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Skills Learned */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Skills Learned</h3>
          {skillsLearned.length === 0 ? (
            <p className="text-sm text-gray-400">None listed</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {skillsLearned.map((skill) => (
                <span key={skill} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded px-2 py-0.5">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Knowledge Built */}
        {knowledgeBuilt && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Knowledge Built</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {Array.isArray(knowledgeBuilt) ? knowledgeBuilt.join(', ') : knowledgeBuilt}
        </p>
        </div>
        )}
      </div>
    </div>
  );
}