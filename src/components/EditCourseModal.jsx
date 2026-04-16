import React, { useState, useEffect } from 'react';
import { updateCourse } from '../services/courseService';

export default function EditCourseModal({ isOpen, onClose, onCourseUpdated, course, allCourses }) {
  const [formData, setFormData] = useState({
    courseCode: '',
    courseTitle: '',
    units: '',
    yearLevel: '1',
    semester: '1',
    prerequisites: [],
    skillsLearned: '',
    knowledgeBuilt: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      const skillsString = Array.isArray(course.skillsLearned) 
        ? course.skillsLearned.join(', ')
        : course.skillsLearned || '';

      setFormData({
        courseCode: course.courseCode || '',
        courseTitle: course.courseTitle || '',
        units: course.units || '',
        yearLevel: String(course.yearLevel || '1'),
        semester: String(course.semester || '1'),
        prerequisites: course.prerequisites || [],
        skillsLearned: skillsString,
        knowledgeBuilt: course.knowledgeBuilt || ''
      });
      setError('');
    }
  }, [course, isOpen]);

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
    setFormData(prev => ({ ...prev, skillsLearned: e.target.value }));
  };

  const validateForm = () => {
    const { courseCode, courseTitle, units } = formData;
    if (!courseCode.trim()) { setError('Course Code is required'); return false; }
    if (!courseTitle.trim()) { setError('Course Title is required'); return false; }
    if (!units || units <= 0) { setError('Units must be a positive number'); return false; }
    return true;
  };

  const validateCourseCodeExists = () => {
    const { courseCode } = formData;
    // Only validate if the course code has been changed
    if (courseCode.toUpperCase() !== course.courseCode.toUpperCase()) {
      const courseExists = allCourses.some(c => c.courseCode.toUpperCase() === courseCode.toUpperCase());
      if (courseExists) {
        setError(`Course Code "${courseCode}" already exists. Please use a different code.`);
        return false;
      }
    }
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

  const parseSkills = () => {
    return formData.skillsLearned
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    if (!validateCourseCodeExists()) return;
    if (!validatePrerequisites()) return;
    setLoading(true);
    try {
      await updateCourse(course.id, {
        courseCode: String(formData.courseCode || '').trim(),
        courseTitle: String(formData.courseTitle || '').trim(),
        units: parseInt(formData.units),
        yearLevel: parseInt(formData.yearLevel),
        semester: String(formData.semester || ''),
        prerequisites: Array.isArray(formData.prerequisites) ? formData.prerequisites : [],
        skillsLearned: parseSkills(),
        knowledgeBuilt: String(formData.knowledgeBuilt || '').trim(),
        updatedAt: new Date()
      });
      onCourseUpdated();
      onClose();
    } catch (err) {
      setError(`Failed to update course: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen || !course) return null;

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Edit Course: <span className="text-blue-600">{formData.courseCode}</span></h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
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
            <div>
              <label className={labelClass}>Course Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleInputChange}
                placeholder="e.g., CS101"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Course Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleInputChange}
                placeholder="e.g., Intro to Programming"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Row 2: Units, Year Level, Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Units <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="units"
                value={formData.units}
                onChange={handleInputChange}
                placeholder="e.g., 3"
                min="1"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Year Level</label>
              <select name="yearLevel" value={formData.yearLevel} onChange={handleInputChange} className={inputClass}>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Semester</label>
              <select name="semester" value={formData.semester} onChange={handleInputChange} className={inputClass}>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <label className={labelClass}>Prerequisites</label>
            <select
              multiple
              value={formData.prerequisites}
              onChange={handlePrerequisiteChange}
              className={`${inputClass} h-32`}
            >
              {allCourses
                .filter(c => c.courseCode !== formData.courseCode)
                .map(course => (
                  <option key={course.courseCode} value={course.courseCode}>
                    {course.courseCode} — {course.courseTitle}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl / Cmd to select multiple</p>
          </div>

          {/* Skills Learned */}
          <div>
            <label className={labelClass}>Skills Learned</label>
            <input
              type="text"
              name="skillsLearned"
              value={formData.skillsLearned}
              onChange={handleSkillsChange}
              placeholder="e.g., Problem Solving, Java, OOP"
              className={inputClass}
            />
            <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
          </div>

          {/* Knowledge Built */}
          <div>
            <label className={labelClass}>Knowledge Built</label>
            <textarea
              name="knowledgeBuilt"
              value={formData.knowledgeBuilt}
              onChange={handleInputChange}
              placeholder="Describe the key concepts students will gain..."
              rows="3"
              className={inputClass}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-150 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-150 min-h-[44px] disabled:opacity-60"
            >
              {loading ? 'Updating Course...' : 'Update Course'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}