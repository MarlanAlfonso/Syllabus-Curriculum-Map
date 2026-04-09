import React, { useState, useEffect } from 'react';
import AddCourseModal from '../components/AddCourseModal';
import EditCourseModal from '../components/EditCourseModal';
import SoftDisableConfirmDialog from '../components/SoftDisableConfirmDialog';
import { getCourses } from '../services/courseService';

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [disablingCourse, setDisablingCourse] = useState(null);

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh courses after add
  const handleCourseAdded = () => {
    fetchCourses();
  };

  // Refresh courses after update
  const handleCourseUpdated = () => {
    fetchCourses();
  };

  // Refresh courses after disable
  const handleCourseDisabled = () => {
    setDisablingCourse(null);
    fetchCourses();
  };

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div className="course-list-page">
      <div className="page-header">
        <h1>Course Management</h1>
        <button
          className="btn-add-course"
          onClick={() => setIsAddOpen(true)}
        >
          + Add New Course
        </button>
      </div>

      <div className="courses-table-container">
        {courses.length === 0 ? (
          <p className="empty-state">No courses yet. Click "Add New Course" to create one.</p>
        ) : (
          <table className="courses-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Units</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Prerequisites</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseTitle}</td>
                  <td>{course.units}</td>
                  <td>Year {course.yearLevel}</td>
                  <td>{course.semester}</td>
                  <td>
                    {course.prerequisites && course.prerequisites.length > 0
                      ? course.prerequisites.join(', ')
                      : 'None'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => setEditingCourse(course)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-disable"
                        onClick={() => setDisablingCourse(course)}
                      >
                        Disable
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCourseAdded={handleCourseAdded}
        allCourses={courses}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        isOpen={editingCourse !== null}
        onClose={() => setEditingCourse(null)}
        onCourseUpdated={handleCourseUpdated}
        course={editingCourse}
        allCourses={courses}
      />

      {/* Soft Disable Confirmation Dialog */}
      <SoftDisableConfirmDialog
        isOpen={disablingCourse !== null}
        onClose={() => setDisablingCourse(null)}
        onDisabled={handleCourseDisabled}
        courseId={disablingCourse?.id}
        courseCode={disablingCourse?.courseCode}
      />
    </div>
  );
}