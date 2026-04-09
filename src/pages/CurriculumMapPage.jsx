import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/courseService';
import '../styles/CurriculumMapPage.css';

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
      const grouped = groupCoursesByYearAndSemester(fetchedCourses);
      setGroupedCourses(grouped);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const initializeGroupedStructure = () => {
    const grouped = {};
    for (let year = 1; year <= 4; year++) {
      grouped[year] = {
        '1st': [],
        '2nd': [],
        'Summer': []
      };
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
      const semesterRaw = course.semester || 1;
      const semester = convertSemesterValue(semesterRaw);
      
      if (grouped[year] && grouped[year][semester] !== undefined) {
        grouped[year][semester].push(course);
      }
    });

    return grouped;
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const getTotalCourses = () => {
    let total = 0;
    Object.values(groupedCourses).forEach(year => {
      Object.values(year).forEach(semester => {
        total += semester.length;
      });
    });
    return total;
  };

  const getTotalUnits = () => {
    return courses.reduce((sum, c) => sum + (c.units || 0), 0);
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Loading curriculum map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-error">
        <h2>❌ Error Loading Map</h2>
        <p>{error}</p>
        <button onClick={fetchAndGroupCourses} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  const totalCourses = getTotalCourses();
  if (totalCourses === 0) {
    return (
      <div className="map-empty">
        <h2>📚 No Active Courses</h2>
        <p>
          Add courses in the{' '}
          <a href="/courses" className="link">
            Course Management
          </a>
          {' '}section.
        </p>
      </div>
    );
  }

  return (
    <div className="curriculum-map-page">
      <div className="map-header">
        <h1>Curriculum Map</h1>
        <p className="map-subtitle">Courses organized by year level and semester</p>
      </div>

      <div className="map-stats">
        <div className="stat">
          <span className="stat-label">Total Courses</span>
          <span className="stat-value">{totalCourses}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total Units</span>
          <span className="stat-value">{getTotalUnits()}</span>
        </div>
      </div>

      <div className="curriculum-tree">
        {[1, 2, 3, 4].map(year => {
          const yearData = groupedCourses[year];
          const yearHasCourses = 
            yearData['1st'].length > 0 || 
            yearData['2nd'].length > 0 || 
            yearData['Summer'].length > 0;
          const isExpanded = expandedYears[year];

          return (
            <div key={year} className="year-block">
              <div
                className="year-header"
                onClick={() => toggleYear(year)}
              >
                <span className="year-toggle">
                  {isExpanded ? '▼' : '▶'}
                </span>
                <h2 className="year-title">Year {year}</h2>
                <span className="year-count">
                  {yearData['1st'].length + yearData['2nd'].length + yearData['Summer'].length} courses
                </span>
              </div>

              {isExpanded && (
                <div className="year-content">
                  {['1st', '2nd', 'Summer'].map(semester => {
                    const semesterCourses = yearData[semester] || [];

                    return (
                      <div key={`${year}-${semester}`} className="semester-block">
                        <h3 className="semester-header">
                          {semester} Semester
                          <span className="semester-count">
                            {semesterCourses.length > 0 && `(${semesterCourses.length})`}
                          </span>
                        </h3>

                        {semesterCourses.length === 0 ? (
                          <div className="empty-semester">
                            No courses scheduled
                          </div>
                        ) : (
                          <table className="courses-table">
                            <thead>
                              <tr>
                                <th className="col-code">Code</th>
                                <th className="col-title">Title</th>
                                <th className="col-units">Units</th>
                                <th className="col-prerequisites">Prerequisites</th>
                                <th className="col-skills">Skills</th>
                              </tr>
                            </thead>
                            <tbody>
                              {semesterCourses
                                .sort((a, b) =>
                                  a.courseCode.localeCompare(b.courseCode)
                                )
                                .map((course, idx) => (
                                  <tr key={course.id || idx} className="course-row">
                                    <td className="col-code">
                                      <strong>{course.courseCode}</strong>
                                    </td>
                                    <td className="col-title">
                                      <div className="course-title-cell">
                                        <div className="course-name">
                                          {course.courseTitle}
                                        </div>
                                        {course.knowledgeBuilt && (
                                          <div className="course-knowledge">
                                            {course.knowledgeBuilt}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="col-units">
                                      <span className="units-badge">
                                        {course.units}
                                      </span>
                                    </td>
                                    <td className="col-prerequisites">
                                      {course.prerequisites &&
                                      course.prerequisites.length > 0 ? (
                                        <div className="prerequisites-list">
                                          {course.prerequisites.map(
                                            (prereq, idx) => (
                                              <span key={idx} className="prereq-tag">
                                                {prereq}
                                              </span>
                                            )
                                          )}
                                        </div>
                                      ) : (
                                        <span className="no-prerequisite">—</span>
                                      )}
                                    </td>
                                    <td className="col-skills">
                                      {course.skillsLearned &&
                                      course.skillsLearned.length > 0 ? (
                                        <div className="skills-list">
                                          {course.skillsLearned.slice(0, 2).map(
                                            (skill, idx) => (
                                              <span key={idx} className="skill-badge">
                                                {skill}
                                              </span>
                                            )
                                          )}
                                          {course.skillsLearned.length > 2 && (
                                            <span className="skill-more">
                                              +{course.skillsLearned.length - 2}
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="no-skills">—</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
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
  );
}