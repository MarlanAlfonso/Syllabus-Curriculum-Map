import React, { useState } from 'react';
import { addCourse } from '../services/courseService';

export default function AddCourseModal({ isOpen, onClose, onCourseAdded, allCourses = [] }) {
  const [formData, setFormData] = useState({
    courseCode: '',
    courseTitle: '',
    units: '',
    yearLevel: '1',
    semester: '1st',
    prerequisites: [],
    skillsLearned: [],
    knowledgeBuilt: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePrerequisiteChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, prerequisites: selected }));
  };

  const handleSkillsChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      skillsLearned: value.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
    }));
  };

  const validateForm = () => {
    const { courseCode, courseTitle, units } = formData;
    if (!courseCode.trim()) { setError('Course Code is required'); return false; }
    if (!courseTitle.trim()) { setError('Course Title is required'); return false; }
    if (!units || units <= 0) { setError('Units must be a positive number'); return false; }
    return true;
  };

  const validatePrerequisites = () => {
    const { prerequisites, courseCode } = formData;
    for (let prereqCode of prerequisites) {
      const prereq = allCourses.find(c => c.courseCode === prereqCode);
      if (prereq && prereq.prerequisites && prereq.prerequisites.includes(courseCode)) {
        setError(`Circular prerequisite detected: ${prereqCode} already depends on ${courseCode}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    if (!validatePrerequisites()) return;
    setLoading(true);
    try {
      await addCourse({
        courseCode: formData.courseCode.trim(),
        courseTitle: formData.courseTitle.trim(),
        units: parseInt(formData.units),
        yearLevel: parseInt(formData.yearLevel),
        semester: formData.semester,
        prerequisites: formData.prerequisites,
        skillsLearned: formData.skillsLearned,
        knowledgeBuilt: formData.knowledgeBuilt.trim(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      onCourseAdded();
      handleReset();
      onClose();
    } catch (err) {
      setError(`Failed to add course: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      courseCode: '',
      courseTitle: '',
      units: '',
      yearLevel: '1',
      semester: '1st',
      prerequisites: [],
      skillsLearned: [],
      knowledgeBuilt: ''
    });
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Add New Course</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Row 1: Course Code & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Course Code *</label>
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleInputChange}
                placeholder="e.g., CS101"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Course Title *</label>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleInputChange}
                placeholder="e.g., Intro to Programming"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Units, Year Level, Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Units *</label>
              <input
                type="number"
                name="units"
                value={formData.units}
                onChange={handleInputChange}
                placeholder="e.g., 3"
                min="1"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Year Level</label>
              <select
                name="yearLevel"
                value={formData.yearLevel}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Prerequisites</label>
            <select
              multiple
              value={formData.prerequisites}
              onChange={handlePrerequisiteChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            >
              {allCourses.map(course => (
                <option key={course.courseCode} value={course.courseCode}>
                  {course.courseCode} — {course.courseTitle}
                </option>
              ))}
            </select>
            <small className="text-gray-400 text-xs">Hold Ctrl (or Cmd on Mac) to select multiple courses</small>
          </div>

          {/* Skills Learned */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Skills Learned</label>
            <input
              type="text"
              value={formData.skillsLearned.join(', ')}
              onChange={handleSkillsChange}
              placeholder="e.g., Problem Solving, Java, Object-Oriented Design"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <small className="text-gray-400 text-xs">Separate skills with commas</small>
          </div>

          {/* Knowledge Built */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Knowledge Built</label>
            <textarea
              name="knowledgeBuilt"
              value={formData.knowledgeBuilt}
              onChange={handleInputChange}
              placeholder="Describe the key concepts and knowledge students will gain..."
              rows="4"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition duration-200 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition duration-200 min-h-[44px]"
            >
              {loading ? 'Adding Course...' : 'Add Course'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}