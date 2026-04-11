import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/courseService';

const YEAR_STYLES = {
  1: {
    header: 'bg-blue-600 hover:bg-blue-700',
    border: 'border-l-4 border-blue-600',
    badge: 'bg-blue-100 text-blue-800',
    semesterBg: 'bg-blue-50',
    unitsBadge: 'bg-blue-100 text-blue-800',
  },
  2: {
    header: 'bg-green-600 hover:bg-green-700',
    border: 'border-l-4 border-green-600',
    badge: 'bg-green-100 text-green-800',
    semesterBg: 'bg-green-50',
    unitsBadge: 'bg-green-100 text-green-800',
  },
  3: {
    header: 'bg-yellow-500 hover:bg-yellow-600',
    border: 'border-l-4 border-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800',
    semesterBg: 'bg-yellow-50',
    unitsBadge: 'bg-yellow-100 text-yellow-800',
  },
  4: {
    header: 'bg-purple-600 hover:bg-purple-700',
    border: 'border-l-4 border-purple-600',
    badge: 'bg-purple-100 text-purple-800',
    semesterBg: 'bg-purple-50',
    unitsBadge: 'bg-purple-100 text-purple-800',
  },
};

export default function CurriculumMapPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedCourses, setGroupedCourses] = useState({});
  const [expandedYears, setExpandedYears] = useState({ 1: true, 2: true, 3: true, 4: true });

  useEffect(() => {
    fetchAndGroupCourses();
  }, []);

  const fetchAndGroupCourses = async () => {
    try {
      setLoading(true);
      const fetchedCourses = await getCourses();
      if (!fetchedCourses || fetchedCourses.length === 0) {
        setCourses([]);
        setGroupedCourses(initializeGroupedStructure());
        setLoading(false);
        return;
      }
      setCourses(fetchedCourses);
      setGroupedCourses(groupCoursesByYearAndSemester(fetchedCourses));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const initializeGroupedStructure = () => {
    const grouped = {};
    for (let year = 1; year <= 4; year++) {
      grouped[year] = { '1st': [], '2nd': [], 'Summer': [] };
    }
    return grouped;
  };

  const convertSemesterValue = (semesterValue) => {
    if (semesterValue === 1 || semesterValue === '1') return '1st';
    if (semesterValue === 2 || semesterValue === '2') return '2nd';
    if (semesterValue === 'Summer' || semesterValue === 'summer') return 'Summer';
    return semesterValue;
  };

  const groupCoursesByYearAndSemester = (coursesToGroup) => {
    const grouped = initializeGroupedStructure();
    coursesToGroup.forEach(course => {
      const year = course.yearLevel || 1;
      const semester = convertSemesterValue(course.semester || 1);
      if (grouped[year] && grouped[year][semester] !== undefined) {
        grouped[year][semester].push(course);
      }
    });
    return grouped;
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const getTotalCourses = () => {
    let total = 0;
    Object.values(groupedCourses).forEach(year => {
      Object.values(year).forEach(sem => { total += sem.length; });
    });
    return total;
  };

  const getTotalUnits = () => courses.reduce((sum, c) => sum + (c.units || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-base">Loading curriculum map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow p-10 text-center max-w-md">
          <h2 className="text-red-600 text-xl font-semibold mb-3">❌ Error Loading Map</h2>
          <p className="text-gray-500 mb-5">{error}</p>
          <button
            onClick={fetchAndGroupCourses}
            className="px-5 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalCourses = getTotalCourses();
  if (totalCourses === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow p-16 text-center max-w-md">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">📚 No Active Courses</h2>
          <p className="text-gray-500 text-sm">
            Add courses in the{' '}
            <a href="/courses" className="text-blue-600 font-semibold hover:underline">
              Course Management
            </a>{' '}
            section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Curriculum Map</h1>
          <p className="text-sm text-gray-500 mt-1">Courses organized by year level and semester</p>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 bg-white rounded-lg shadow p-5 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Courses</span>
            <span className="text-4xl font-bold text-blue-600">{totalCourses}</span>
          </div>
          <div className="flex-1 bg-white rounded-lg shadow p-5 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Units</span>
            <span className="text-4xl font-bold text-blue-600">{getTotalUnits()}</span>
          </div>
        </div>

        {/* Year Blocks */}
        <div className="flex flex-col gap-6">
          {[1, 2, 3, 4].map(year => {
            const yearData = groupedCourses[year];
            const styles = YEAR_STYLES[year];
            const isExpanded = expandedYears[year];
            const courseCount = yearData['1st'].length + yearData['2nd'].length + yearData['Summer'].length;

            return (
              <div key={year} className={`bg-white rounded-lg shadow overflow-hidden ${styles.border}`}>

                {/* Year Header */}
                <div
                  className={`flex items-center gap-3 px-5 py-4 cursor-pointer select-none text-white transition-colors ${styles.header}`}
                  onClick={() => toggleYear(year)}
                >
                  <span className="text-sm font-bold">{isExpanded ? '▼' : '▶'}</span>
                  <h2 className="text-lg font-bold flex-1">Year {year}</h2>
                  <span className="text-xs font-medium opacity-80">
                    {courseCount} courses
                  </span>
                </div>

                {/* Year Content */}
                {isExpanded && (
                  <div>
                    {['1st', '2nd', 'Summer'].map(semester => {
                      const semesterCourses = yearData[semester] || [];

                      return (
                        <div key={`${year}-${semester}`} className="border-t border-gray-200">

                          {/* Semester Header */}
                          <div className={`flex items-center justify-between px-6 py-3 ${styles.semesterBg}`}>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                              {semester} Semester
                            </h3>
                            {semesterCourses.length > 0 && (
                              <span className="text-xs text-gray-500">({semesterCourses.length} courses)</span>
                            )}
                          </div>

                          {/* Courses */}
                          {semesterCourses.length === 0 ? (
                            <div className="px-6 py-5 text-center text-sm text-gray-400 bg-gray-50 italic">
                              No courses scheduled
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Units</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Prerequisites</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Skills</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {semesterCourses
                                    .sort((a, b) => a.courseCode.localeCompare(b.courseCode))
                                    .map((course, idx) => (
                                      <tr
                                        key={course.id || idx}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
                                      >
                                        {/* Course Code */}
                                        <td className="px-4 py-3">
                                          <span className="font-bold text-gray-800 font-mono text-sm">
                                            {course.courseCode}
                                          </span>
                                        </td>

                                        {/* Course Title */}
                                        <td className="px-4 py-3">
                                          <div className="font-medium text-gray-800 text-sm">{course.courseTitle}</div>
                                          {course.knowledgeBuilt && (
                                            <div className="text-xs text-gray-400 italic mt-0.5">{course.knowledgeBuilt}</div>
                                          )}
                                        </td>

                                        {/* Units */}
                                        <td className="px-4 py-3 text-center">
                                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${styles.unitsBadge}`}>
                                            {course.units}
                                          </span>
                                        </td>

                                        {/* Prerequisites */}
                                        <td className="px-4 py-3 hidden md:table-cell">
                                          {course.prerequisites && course.prerequisites.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                              {course.prerequisites.map((prereq, i) => (
                                                <span
                                                  key={i}
                                                  className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-medium"
                                                >
                                                  {prereq}
                                                </span>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="text-gray-300 italic text-sm">None</span>
                                          )}
                                        </td>

                                        {/* Skills */}
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                          {course.skillsLearned && course.skillsLearned.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 items-center">
                                              {course.skillsLearned.slice(0, 2).map((skill, i) => (
                                                <span
                                                  key={i}
                                                  className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-medium"
                                                >
                                                  {skill}
                                                </span>
                                              ))}
                                              {course.skillsLearned.length > 2 && (
                                                <span className="text-xs text-gray-400 font-medium">
                                                  +{course.skillsLearned.length - 2}
                                                </span>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-gray-300 italic text-sm">—</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
