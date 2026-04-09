import React, { useState } from 'react';
import { disableCourse } from '../services/courseService';
import '../styles/ConfirmDialog.css';

export default function SoftDisableConfirmDialog({
  isOpen,
  onClose,
  onDisabled,
  courseId,
  courseCode
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmDisable = async () => {
    if (!courseId) return;

    setLoading(true);
    setError('');

    try {
      // Call disableCourse — this sets isActive: false
      await disableCourse(courseId);
      
      // Success: notify parent to refresh the list
      onDisabled();
      
      // Close dialog
      onClose();
    } catch (err) {
      setError(`Failed to disable course: ${err.message}`);
      console.error('Disable course error:', err);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog-box" onClick={e => e.stopPropagation()}>
        <div className="dialog-icon warning">⚠</div>
        
        <h3 className="dialog-title">Disable Course?</h3>
        
        <p className="dialog-message">
          Are you sure you want to remove <strong>{courseCode}</strong> from the curriculum map?
        </p>
        
        <p className="dialog-subtitle">
          This action can be undone by an administrator.
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="dialog-actions">
          <button
            onClick={handleCancel}
            className="btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDisable}
            className="btn-confirm-danger"
            disabled={loading}
          >
            {loading ? 'Disabling...' : 'Confirm Disable'}
          </button>
        </div>
      </div>
    </div>
  );
}