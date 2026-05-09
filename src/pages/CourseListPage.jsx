import { useEffect, useState } from "react";
import { getCourses, disableCourse, updateCourse } from "../services/courseService";
import AddCourseModal from "../components/AddCourseModal";
import EditCourseModal from "../components/EditCourseModal";

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  async function fetchCourses() {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      setError("Failed to load courses.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(course) {
    try {
      if (course.isActive) {
        await disableCourse(course.id);
      } else {
        await updateCourse(course.id, { isActive: true });
      }
      fetchCourses();
    } catch (err) {
      console.error("Failed to toggle course status", err);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-500 text-lg animate-pulse">Loading courses...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-red-500 text-lg">{error}</div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow transition duration-200 min-h-[44px]"
        >
          + Add Course
        </button>
      </div>

      {/* Empty State */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <span className="text-5xl mb-4">📚</span>
          <p className="text-lg font-medium">No courses yet</p>
          <p className="text-sm">Click "Add Course" to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold">Course Code</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold">Course Title</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold">Units</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold">Year Level</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left font-semibold">Semester</th>
                <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold">Status</th>
                <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr
                  key={course.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${!course.isActive ? "opacity-50" : ""} hover:bg-blue-50 transition duration-150`}
                >
                  <td className="px-4 py-3 border-b border-gray-100 font-medium text-gray-800">{course.courseCode}</td>
                  <td className="px-4 py-3 border-b border-gray-100 text-gray-700">{course.courseTitle}</td>
                  <td className="px-4 py-3 border-b border-gray-100 text-gray-700">{course.units}</td>
                  <td className="px-4 py-3 border-b border-gray-100 text-gray-700">{course.yearLevel}</td>
                  <td className="px-4 py-3 border-b border-gray-100 text-gray-700">{course.semester}</td>
                  <td className="px-4 py-3 border-b border-gray-100 text-center">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${course.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {course.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setEditingCourse(course)}
                        disabled={!course.isActive}
                        className={`px-3 py-1.5 rounded text-white text-xs font-medium min-h-[44px] transition duration-200 ${course.isActive ? "bg-blue-500 hover:bg-blue-600 cursor-pointer" : "bg-blue-300 cursor-not-allowed opacity-50"}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(course)}
                        className={`px-3 py-1.5 rounded text-white text-xs font-medium min-h-[44px] transition duration-200 ${course.isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
                      >
                        {course.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddCourseModal
          onClose={() => setShowAddModal(false)}
          onCourseAdded={fetchCourses}
        />
      )}

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onCourseUpdated={fetchCourses}
        />
      )}
    </div>
  );
}