import React, { useState, useEffect } from 'react';
import { updateCourse } from '../services/courseService';
import '../styles/Modal.css';

export default function EditCourseModal({ isOpen, onClose, onCourseUpdated, course, allCourses }) {
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

  // Pre-fill form when course prop changes
  useEffect(() => {
    if (course) {
      setFormData({
        courseCode: course.courseCode || '',
        courseTitle: course.courseTitle || '',
        units: course.units || '',
        yearLevel: String(course.yearLevel || '1'),
        semester: course.semester || '1st',
        prerequisites: course.prerequisites || [],
        skillsLearned: course.skillsLearned || [],
        knowledgeBuilt: course.knowledgeBuilt || ''
      });
      setError('');
    }
  }, [course, isOpen]);

  // Handle text/number input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Handle multi-select for prerequisites
  const handlePrerequisiteChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      prerequisites: selected
    }));
  };

  // Handle skills tag input (comma-separated)
  const handleSkillsChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      skillsLearned: value.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
    }));
  };

  // Validate form data
  const validateForm = () => {
    const { courseCode, courseTitle, units } = formData;
    
    if (!courseCode.trim()) {
      setError('Course Code is required');
      return false;
    }
    
    if (!courseTitle.trim()) {
      setError('Course Title is required');
      return false;
    }
    
    if (!units || units <= 0) {
      setError('Units must be a positive number');
      return false;
    }
    
    return true;
  };

  // Validate prerequisites (no circular dependencies)
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    if (!validatePrerequisites()) return;
    
    setLoading(true);
    
    try {
      await updateCourse(course.id, {
        courseCode: formData.courseCode.trim(),
        courseTitle: formData.courseTitle.trim(),
        units: parseInt(formData.units),
        yearLevel: parseInt(formData.yearLevel),
        semester: formData.semester,
        prerequisites: formData.prerequisites,
        skillsLearned: formData.skillsLearned,
        knowledgeBuilt: formData.knowledgeBuilt.trim(),
        updatedAt: new Date()
      });
      
      // Success callback
      onCourseUpdated();
      onClose();
    } catch (err) {
      setError(`Failed to update course: ${err.message}`);
      console.error('Update course error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen || !course) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Course: {formData.courseCode}</h2>
          <button className="close-btn" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="course-form">
          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Row 1: Course Code & Title */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="courseCode">Course Code *</label>
              <input
                id="courseCode"
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleInputChange}
                placeholder="e.g., CS101"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="courseTitle">Course Title *</label>
              <input
                id="courseTitle"
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleInputChange}
                placeholder="e.g., Intro to Programming"
                required
              />
            </div>
          </div>

          {/* Row 2: Units, Year Level, Semester */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="units">Units *</label>
              <input
                id="units"
                type="number"
                name="units"
                value={formData.units}
                onChange={handleInputChange}
                placeholder="e.g., 3"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="yearLevel">Year Level</label>
              <select
                id="yearLevel"
                name="yearLevel"
                value={formData.yearLevel}
                onChange={handleInputChange}
              >
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="semester">Semester</label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
              >
                <option value="1st">1st Semester</option>
                <option value="2nd">2nd Semester</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>

          {/* Prerequisites Multi-Select */}
          <div className="form-group full-width">
            <label htmlFor="prerequisites">Prerequisites</label>
            <select
              id="prerequisites"
              multiple
              value={formData.prerequisites}
              onChange={handlePrerequisiteChange}
              className="multi-select"
            >
              {allCourses
                .filter(c => c.courseCode !== formData.courseCode) // Don't allow self-reference
                .map(course => (
                  <option key={course.courseCode} value={course.courseCode}>
                    {course.courseCode} — {course.courseTitle}
                  </option>
                ))}
            </select>
            <small>Hold Ctrl (or Cmd on Mac) to select multiple courses</small>
          </div>

          {/* Skills Learned (Tag Input - Temporary) */}
          <div className="form-group full-width">
            <label htmlFor="skillsLearned">Skills Learned</label>
            <input
              id="skillsLearned"
              type="text"
              value={formData.skillsLearned.join(', ')}
              onChange={handleSkillsChange}
              placeholder="e.g., Problem Solving, Java, Object-Oriented Design"
              className="tag-input"
            />
            <small>Separate skills with commas</small>
          </div>

          {/* Knowledge Built */}
          <div className="form-group full-width">
            <label htmlFor="knowledgeBuilt">Knowledge Built</label>
            <textarea
              id="knowledgeBuilt"
              name="knowledgeBuilt"
              value={formData.knowledgeBuilt}
              onChange={handleInputChange}
              placeholder="Describe the key concepts and knowledge students will gain..."
              rows="4"
            />
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={handleClose} className="btn-cancel">
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating Course...' : 'Update Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}