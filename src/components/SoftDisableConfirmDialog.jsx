import React, { useState } from 'react';
import { disableCourse } from '../services/courseService';

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
      await disableCourse(courseId);
      onDisabled();
      onClose();
    } catch (err) {
      setError(`Failed to disable course: ${err.message}`);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-xl font-bold text-gray-800">Disable Course?</h3>
        </div>

        {/* Message */}
        <p className="text-gray-600 text-sm mb-2">
          Are you sure you want to disable{' '}
          <span className="font-semibold text-gray-900">{courseCode}</span>{' '}
          from the curriculum map?
        </p>
        <p className="text-gray-400 text-xs mb-5">
          This action can be undone by an administrator.
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-150 min-h-[44px] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDisable}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition duration-150 min-h-[44px] disabled:opacity-60"
          >
            {loading ? 'Disabling...' : 'Confirm Disable'}
          </button>
        </div>
      </div>
    </div>
  );
}
