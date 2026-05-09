import React, { useState } from 'react';
import { addCourse } from '../services/courseService';
import { CourseForm, ModalShell } from './CourseForm';

const defaultForm = {
  courseCode: '', courseTitle: '', units: '',
  yearLevel: '1', semester: '1',
  prerequisites: [], skillsLearned: '', knowledgeBuilt: ''
};

export default function AddCourseModal({ isOpen, onClose, onCourseAdded, allCourses }) {
  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const { courseCode, courseTitle, units } = formData;
    if (!courseCode.trim()) { setError('Course Code is required.'); return false; }
    if (!courseTitle.trim()) { setError('Course Title is required.'); return false; }
    if (!units || units <= 0) { setError('Units must be a positive number.'); return false; }
    return true;
  };

  const validateCourseCodeExists = () => {
    const exists = allCourses.some(c => c.courseCode.toUpperCase() === formData.courseCode.toUpperCase());
    if (exists) { setError(`Course Code "${formData.courseCode}" already exists.`); return false; }
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
      await addCourse({
        courseCode: formData.courseCode.trim(),
        courseTitle: formData.courseTitle.trim(),
        units: parseInt(formData.units),
        yearLevel: parseInt(formData.yearLevel),
        semester: formData.semester,
        prerequisites: formData.prerequisites,
        skillsLearned: parseSkills(),
        knowledgeBuilt: formData.knowledgeBuilt.trim(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      onCourseAdded();
      setFormData(defaultForm);
      setError('');
      onClose();
    } catch (err) {
      setError(`Failed to add course: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(defaultForm);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalShell title="Add New Course" subtitle="Curriculum Management" onClose={handleClose}>
      <CourseForm
        formData={formData}
        setFormData={setFormData}
        error={error}
        loading={loading}
        onSubmit={handleSubmit}
        onClose={handleClose}
        submitLabel="Add Course"
        allCourses={allCourses}
        excludeCode={null}
      />
    </ModalShell>
  );
}