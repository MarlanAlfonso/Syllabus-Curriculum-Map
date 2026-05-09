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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="text-5xl mb-3">⚠️</div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">Disable Course?</h3>

        {/* Message */}
        <p className="text-gray-600 text-sm mb-1">
          Are you sure you want to disable <strong className="text-gray-800">{courseCode}</strong> from the curriculum map?
        </p>

        {/* Subtitle */}
        <p className="text-gray-400 text-xs mb-4">
          This action can be undone by an administrator.
        </p>

        {/* Error */}
        {error && (
          <div className="w-full bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition duration-200 min-h-[44px] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDisable}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition duration-200 min-h-[44px] disabled:opacity-60"
          >
            {loading ? 'Disabling...' : 'Confirm Disable'}
          </button>
        </div>
      </div>
    </div>
  );
}