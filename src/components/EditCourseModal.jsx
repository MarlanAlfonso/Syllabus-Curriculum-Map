import React, { useState, useEffect } from 'react';
import { updateCourse } from '../services/courseService';
import { CourseForm, ModalShell } from './CourseForm';

export default function EditCourseModal({ isOpen, onClose, onCourseUpdated, course, allCourses }) {
  const [formData, setFormData] = useState({
    courseCode: '', courseTitle: '', units: '',
    yearLevel: '1', semester: '1',
    prerequisites: [], skillsLearned: '', knowledgeBuilt: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        courseCode: course.courseCode || '',
        courseTitle: course.courseTitle || '',
        units: course.units || '',
        yearLevel: String(course.yearLevel || '1'),
        semester: String(course.semester || '1'),
        prerequisites: course.prerequisites || [],
        skillsLearned: Array.isArray(course.skillsLearned)
          ? course.skillsLearned.join(', ')
          : course.skillsLearned || '',
        knowledgeBuilt: course.knowledgeBuilt || ''
      });
      setError('');
    }
  }, [course, isOpen]);

  const validateForm = () => {
    const { courseCode, courseTitle, units } = formData;
    if (!courseCode.trim()) { setError('Course Code is required.'); return false; }
    if (!courseTitle.trim()) { setError('Course Title is required.'); return false; }
    if (!units || units <= 0) { setError('Units must be a positive number.'); return false; }
    return true;
  };

  const validateCourseCodeExists = () => {
    if (formData.courseCode.toUpperCase() !== course.courseCode.toUpperCase()) {
      const exists = allCourses.some(c => c.courseCode.toUpperCase() === formData.courseCode.toUpperCase());
      if (exists) { setError(`Course Code "${formData.courseCode}" already exists.`); return false; }
    }
    return true;
  };

  const validatePrerequisites = () => {
    for (let prereqCode of formData.prerequisites) {
      const prereq = allCourses.find(c => c.courseCode === prereqCode);
      if (prereq?.prerequisites?.includes(formData.courseCode)) {
        setError(`Circular prerequisite: ${prereqCode} already depends on ${formData.courseCode}`);
        return false;
      }
    }
    return true;
  };

  const parseSkills = () =>
    formData.skillsLearned.split(',').map(s => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm() || !validateCourseCodeExists() || !validatePrerequisites()) return;
    setLoading(true);
    try {
      await updateCourse(course.id, {
        courseCode: formData.courseCode.trim(),
        courseTitle: formData.courseTitle.trim(),
        units: parseInt(formData.units),
        yearLevel: parseInt(formData.yearLevel),
        semester: formData.semester,
        prerequisites: formData.prerequisites,
        skillsLearned: parseSkills(),
        knowledgeBuilt: formData.knowledgeBuilt.trim(),
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

  const handleClose = () => { setError(''); onClose(); };

  if (!isOpen || !course) return null;

  return (
    <ModalShell
      title={<>Edit Course <span style={{ color: '#1d4ed8' }}>{formData.courseCode}</span></>}
      subtitle="Curriculum Management"
      onClose={handleClose}
    >
      <CourseForm
        formData={formData}
        setFormData={setFormData}
        error={error}
        loading={loading}
        onSubmit={handleSubmit}
        onClose={handleClose}
        submitLabel="Update Course"
        allCourses={allCourses}
        excludeCode={course.courseCode}
      />
    </ModalShell>
  );
}