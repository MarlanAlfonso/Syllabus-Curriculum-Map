import { useEffect, useState } from "react";
import { getCourses } from "../services/courseService";

export default function CourseListPage() {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchCourses();
  }, []);

  function handleEdit(course) {
    console.log("Edit clicked", course);
  }

  function handleDisable(courseId) {
    console.log("Disable clicked", courseId);
  }

  function handleAddCourse() {
    console.log("Add course clicked");
  }

  if (loading) {
    return <p>Loading courses...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Course List</h1>

        <button
          onClick={handleAddCourse}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Course
        </button>
      </div>

      {courses.length === 0 ? (
        <p>No courses yet — add your first course.</p>
      ) : (
        <table className="min-w-full border border-gray-300">

          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Course Code</th>
              <th className="border p-2">Course Title</th>
              <th className="border p-2">Units</th>
              <th className="border p-2">Year Level</th>
              <th className="border p-2">Semester</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>

                <td className="border p-2">{course.courseCode}</td>
                <td className="border p-2">{course.courseTitle}</td>
                <td className="border p-2">{course.units}</td>
                <td className="border p-2">{course.yearLevel}</td>
                <td className="border p-2">{course.semester}</td>

                <td className="border p-2 space-x-2">

                  <button
                    onClick={() => handleEdit(course)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDisable(course.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Disable
                  </button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>
      )}

    </div>
  );
}