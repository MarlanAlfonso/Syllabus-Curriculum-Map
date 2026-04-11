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

  const handleCourseAdded = () => fetchCourses();
  const handleCourseUpdated = () => fetchCourses();
  const handleCourseDisabled = () => {
    setDisablingCourse(null);
    fetchCourses();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-lg">Loading courses...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition duration-150"
        >
          + Add New Course
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-5xl mb-4">📭</span>
            <p className="text-lg font-medium">No courses yet.</p>
            <p className="text-sm">Click "Add New Course" to create one.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {['Code', 'Title', 'Units', 'Year', 'Semester', 'Prerequisites', 'Actions'].map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {courses.map((course, index) => (
                <tr key={course.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{course.courseCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{course.courseTitle}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{course.units}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Year {course.yearLevel}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{course.semester}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {course.prerequisites && course.prerequisites.length > 0
                      ? course.prerequisites.join(', ')
                      : <span className="italic text-gray-400">None</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCourse(course)}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition duration-150 min-h-[36px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDisablingCourse(course)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition duration-150 min-h-[36px]"
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

      <AddCourseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCourseAdded={handleCourseAdded}
        allCourses={courses}
      />

      <EditCourseModal
        isOpen={editingCourse !== null}
        onClose={() => setEditingCourse(null)}
        onCourseUpdated={handleCourseUpdated}
        course={editingCourse}
        allCourses={courses}
      />

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
