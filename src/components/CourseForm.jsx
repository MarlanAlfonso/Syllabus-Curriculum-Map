import React from 'react';
import { createPortal } from 'react-dom';
import { sortCourses } from '../utils/courseUtils';

const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition placeholder-gray-300";
const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

export function CourseForm({ formData, setFormData, error, loading, onSubmit, onClose, submitLabel, allCourses, excludeCode }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePrereq = (code) => {
    setFormData(prev => {
      const has = prev.prerequisites.includes(code);
      return {
        ...prev,
        prerequisites: has
          ? prev.prerequisites.filter(p => p !== code)
          : [...prev.prerequisites, code],
      };
    });
  };

  const availableCourses = sortCourses(
    allCourses.filter(c => !excludeCode || c.courseCode !== excludeCode)
  );

  // Group by year level for the checklist
  const byYear = availableCourses.reduce((acc, c) => {
    const y = c.yearLevel || 1;
    if (!acc[y]) acc[y] = [];
    acc[y].push(c);
    return acc;
  }, {});

  // Human-readable semester label (stored as "1", "2", "Summer")
  const semesterLabel = (sem) => {
    if (String(sem) === '1') return 'Semester 1';
    if (String(sem) === '2') return 'Semester 2';
    return 'Summer';
  };

  return (
    <form onSubmit={onSubmit} style={{ padding: '20px 24px 24px' }}>
      <style>{formCSS}</style>

      {/* Error */}
      {error && (
        <div className="cf-error">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="6.5" stroke="#dc2626" strokeWidth="1.3"/>
            <path d="M8 5v4M8 10.5v.5" stroke="#dc2626" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── Basic Information ── */}
      <p className="cf-section-label">Basic Information</p>
      <div className="cf-grid2">
        <div>
          <label className={labelClass}>Course Code <span style={{ color: '#ef4444' }}>*</span></label>
          <input type="text" name="courseCode" value={formData.courseCode} onChange={handleChange}
            placeholder="e.g., CCS101-18" className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Course Title <span style={{ color: '#ef4444' }}>*</span></label>
          <input type="text" name="courseTitle" value={formData.courseTitle} onChange={handleChange}
            placeholder="e.g., Intro to Programming" className={inputClass} required />
        </div>
      </div>

      <div className="cf-grid3" style={{ marginTop: 12 }}>
        <div>
          <label className={labelClass}>Units <span style={{ color: '#ef4444' }}>*</span></label>
          <input type="number" name="units" value={formData.units} onChange={handleChange}
            placeholder="3" min="1" className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Year Level</label>
          <select name="yearLevel" value={formData.yearLevel} onChange={handleChange} className={inputClass}>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Semester</label>
          <select name="semester" value={formData.semester} onChange={handleChange} className={inputClass}>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="Summer">Summer</option>
          </select>
        </div>
      </div>

      <div className="cf-divider" />

      {/* ── Prerequisites checklist ── */}
      <p className="cf-section-label">
        Prerequisites
        {formData.prerequisites.length > 0 && (
          <span className="cf-prereq-count">{formData.prerequisites.length} selected</span>
        )}
      </p>

      <div className="cf-checklist-wrap">
        {availableCourses.length === 0 ? (
          <p style={{ fontSize: 12, color: '#9ca3af', padding: '12px 14px' }}>No other courses available.</p>
        ) : (
          Object.keys(byYear).sort((a, b) => a - b).map(year => (
            <div key={year}>
              {/* Year group header */}
              <div className="cf-year-header">Year {year}</div>
              {byYear[year].map(c => {
                const checked = formData.prerequisites.includes(c.courseCode);
                return (
                  <label key={c.courseCode} className={`cf-check-row ${checked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePrereq(c.courseCode)}
                      className="cf-checkbox"
                    />
                    <span className="cf-check-code">{c.courseCode}</span>
                    <span className="cf-check-title">{c.courseTitle}</span>
                    <span className="cf-check-sem">{semesterLabel(c.semester)}</span>
                  </label>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div className="cf-divider" />

      {/* ── Knowledge Details ── */}
      <p className="cf-section-label">Knowledge Details</p>
      <div>
        <label className={labelClass}>Skills Learned</label>
        <input
          type="text"
          name="skillsLearned"
          value={formData.skillsLearned}
          onChange={e => setFormData(prev => ({ ...prev, skillsLearned: e.target.value }))}
          placeholder="e.g., Problem Solving, Java, OOP"
          className={inputClass}
        />
        <p className="cf-hint">Separate skills with commas</p>
      </div>
      <div style={{ marginTop: 12 }}>
        <label className={labelClass}>Knowledge Built</label>
        <textarea
          name="knowledgeBuilt"
          value={formData.knowledgeBuilt}
          onChange={handleChange}
          placeholder="Describe the key concepts students will gain..."
          rows="3"
          className={inputClass}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* ── Actions ── */}
      <div className="cf-actions">
        <button type="button" onClick={onClose} className="cf-btn-cancel">Cancel</button>
        <button type="submit" disabled={loading} className="cf-btn-submit" style={{ opacity: loading ? 0.65 : 1 }}>
          {loading
            ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="cf-spinner" /> Saving...
              </span>
            : submitLabel}
        </button>
      </div>
    </form>
  );
}

const formCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  .cf-section-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.07em;
    text-transform: uppercase; color: #9ca3af;
    margin: 0 0 12px; display: flex; align-items: center; gap: 8px;
  }
  .cf-prereq-count {
    font-size: 10px; padding: 2px 8px; border-radius: 999px;
    background: #dbeafe; color: #1d4ed8; font-weight: 700;
    text-transform: none; letter-spacing: 0;
  }
  .cf-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .cf-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .cf-divider { height: 1px; background: #f3f4f6; margin: 20px 0; }
  .cf-hint { font-size: 11px; color: #9ca3af; margin: 5px 0 0; }
  .cf-error {
    display: flex; align-items: flex-start; gap: 8px;
    background: #fef2f2; border: 1px solid #fecaca;
    color: #dc2626; font-size: 13px;
    padding: 10px 14px; border-radius: 10px; margin-bottom: 16px;
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  /* Checklist */
  .cf-checklist-wrap {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    max-height: 240px;
    overflow-y: auto;
  }
  .cf-year-header {
    padding: 6px 14px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #6b7280;
    background: #f8fafc;
    border-bottom: 1px solid #f3f4f6;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .cf-check-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    cursor: pointer;
    border-bottom: 1px solid #f9fafb;
    transition: background 0.12s;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .cf-check-row:last-child { border-bottom: none; }
  .cf-check-row:hover { background: #f0f7ff; }
  .cf-check-row.checked { background: #eff6ff; }
  .cf-checkbox {
    width: 15px; height: 15px; flex-shrink: 0;
    accent-color: #1d4ed8; cursor: pointer;
    border-radius: 4px;
  }
  .cf-check-code {
    font-size: 11px; font-weight: 700; color: #1d4ed8;
    font-family: 'DM Mono','Fira Code',monospace;
    flex-shrink: 0; min-width: 100px;
  }
  .cf-check-title { font-size: 12px; color: #374151; flex: 1; }
  .cf-check-sem {
    font-size: 10px; color: #9ca3af; flex-shrink: 0;
    background: #f3f4f6; padding: 2px 7px; border-radius: 5px;
  }

  /* Actions */
  .cf-actions {
    display: flex; justify-content: flex-end; gap: 10px;
    margin-top: 24px; padding-top: 20px; border-top: 1px solid #f3f4f6;
  }
  .cf-btn-cancel {
    padding: 9px 20px; border-radius: 10px; border: 1px solid #e5e7eb;
    background: #fff; color: #374151; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit; transition: background 0.15s;
  }
  .cf-btn-cancel:hover { background: #f9fafb; }
  .cf-btn-submit {
    padding: 9px 22px; border-radius: 10px; border: none;
    background: #1d4ed8; color: #fff; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit; transition: background 0.15s, transform 0.15s;
  }
  .cf-btn-submit:hover:not(:disabled) { background: #1e40af; transform: translateY(-1px); }
  .cf-spinner {
    display: inline-block; width: 12px; height: 12px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%;
    animation: cf-spin 0.7s linear infinite;
  }
  @keyframes cf-spin { to { transform: rotate(360deg); } }

  @media (max-width: 500px) {
    .cf-grid2 { grid-template-columns: 1fr !important; }
    .cf-grid3 { grid-template-columns: 1fr 1fr !important; }
  }
`;

/* ── Shared Modal Shell ── */
export function ModalShell({ title, subtitle, onClose, children }) {
  return createPortal(
    <div style={shell.overlay}>
      <div style={shell.modal}>
        <style>{`
          @keyframes cf-overlay-in { from { opacity: 0 } to { opacity: 1 } }
          @keyframes cf-modal-in {
            from { opacity: 0; transform: scale(0.96) translateY(10px) }
            to   { opacity: 1; transform: scale(1) translateY(0) }
          }
        `}</style>
        <div style={shell.header}>
          <div>
            {subtitle && <p style={shell.sub}>{subtitle}</p>}
            <h2 style={shell.title}>{title}</h2>
          </div>
          <button style={shell.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body 
  );
}

const shell = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 50,
    background: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16, backdropFilter: 'blur(3px)',
    animation: 'cf-overlay-in 0.2s ease',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  modal: {
    background: '#fff',
    borderRadius: 18,
    width: '100%', maxWidth: 580,
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 28px 64px rgba(0,0,0,0.2)',
    animation: 'cf-modal-in 0.25s cubic-bezier(0.34,1.2,0.64,1)',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #f3f4f6',
  },
  sub: { fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9ca3af', margin: '0 0 3px' },
  title: { fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 9,
    border: '1px solid #e5e7eb', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s',
  },
};