import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          animation: 'modalSlideIn 0.2s cubic-bezier(0.34,1.2,0.64,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px 24px 12px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v5M14 11v5" />
              <path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              Archive Course
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#475569' }}>
              This action can be undone later.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: 24,
              cursor: 'pointer',
              padding: 4,
              lineHeight: 1,
              borderRadius: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#334155' }}>
            Are you sure you want to archive <strong>{courseCode}</strong>? 
            The course will be moved to the archived section and will not appear in the active curriculum map.
          </p>
          <p style={{ margin: '12px 0 0', fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
            You can restore it later from the Archived tab.
          </p>
          {error && (
            <div style={{
              marginTop: 16,
              padding: '10px 14px',
              borderRadius: 10,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: 13,
            }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px 24px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              background: 'transparent',
              color: '#475569',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDisable}
            disabled={loading}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            {loading && (
              <span style={{
                width: 14,
                height: 14,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
              }} />
            )}
            {loading ? 'Archiving...' : 'Archive Course'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}