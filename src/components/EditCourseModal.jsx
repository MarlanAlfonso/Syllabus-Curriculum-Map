import { useState } from "react";
import { createPortal } from "react-dom";
import { updateCourse } from "../services/courseService";
import TagInput from "./TagInput";

const PROGRAMS = [
  "BS Agriculture", "BA / BS Arts and Sciences", "BS Business Administration",
  "BS Criminology", "BS Engineering / Architecture", "BS Education",
  "BS Information Technology / Computer Science (Informatics & Computing Studies)",
  "BS Midwifery", "BS Physical Therapy", "BS Respiratory Therapy",
  "BS Accountancy", "BS Communication", "Bachelor of Laws", "Bachelor of Music",
  "Doctor of Medicine", "BS Nursing", "BS Medical Technology",
  "BS International Relations",
];

const inputStyle = {
  width: "100%", height: 36, padding: "0 10px",
  border: "1px solid #d1d5db", borderRadius: 8,
  fontSize: 14, outline: "none", fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block", fontSize: 13, fontWeight: 500,
  color: "#6b7280", marginBottom: 5,
};

export default function EditCourseModal({ course, onClose, onCourseUpdated }) {
  const [form, setForm] = useState({
    program: course.program || "",
    courseCode: course.courseCode || "",
    courseTitle: course.courseTitle || "",
    units: course.units || "",
    yearLevel: course.yearLevel || "",
    semester: course.semester || "",
    skills: course.skills || [],
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.program) e.program = "Required";
    if (!form.courseCode.trim()) e.courseCode = "Required";
    if (!form.courseTitle.trim()) e.courseTitle = "Required";
    if (!form.units || form.units < 1 || form.units > 6)
      e.units = "Must be 1–6";
    if (!form.yearLevel) e.yearLevel = "Required";
    if (!form.semester) e.semester = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateCourse(course.id, form);
      onCourseUpdated?.();
      onClose();
    } catch (err) {
      console.error("Failed to update course", err);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: "2rem",
        width: "100%", maxWidth: 600, maxHeight: "90vh",
        overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: "1.5rem" }}>
          Edit Course
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Program <span style={{ color: "#D85A30" }}>*</span></label>
          <select style={inputStyle} value={form.program}
            onChange={(e) => set("program", e.target.value)}>
            <option value="">Select a program...</option>
            {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
          </select>
          {errors.program && <p style={{ color: "#D85A30", fontSize: 12, marginTop: 3 }}>{errors.program}</p>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Course Code <span style={{ color: "#D85A30" }}>*</span></label>
            <input style={inputStyle} placeholder="e.g. CS101"
              value={form.courseCode} onChange={(e) => set("courseCode", e.target.value)} />
            {errors.courseCode && <p style={{ color: "#D85A30", fontSize: 12, marginTop: 3 }}>{errors.courseCode}</p>}
          </div>
          <div>
            <label style={labelStyle}>Units <span style={{ color: "#D85A30" }}>*</span></label>
            <input style={inputStyle} type="number" min={1} max={6}
              placeholder="1–6" value={form.units}
              onChange={(e) => set("units", e.target.value)} />
            {errors.units && <p style={{ color: "#D85A30", fontSize: 12, marginTop: 3 }}>{errors.units}</p>}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Course Title <span style={{ color: "#D85A30" }}>*</span></label>
          <input style={inputStyle} placeholder="e.g. Introduction to Computer Science"
            value={form.courseTitle} onChange={(e) => set("courseTitle", e.target.value)} />
          {errors.courseTitle && <p style={{ color: "#D85A30", fontSize: 12, marginTop: 3 }}>{errors.courseTitle}</p>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Year Level <span style={{ color: "#D85A30" }}>*</span></label>
            <select style={inputStyle} value={form.yearLevel}
              onChange={(e) => set("yearLevel", e.target.value)}>
              <option value="">Select year level...</option>
              {["1st Year","2nd Year","3rd Year","4th Year","5th Year"].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            {errors.yearLevel && <p style={{ color: "#D85A30", fontSize: 12, marginTop: 3 }}>{errors.yearLevel}</p>}
          </div>
          <div>
            <label style={labelStyle}>Semester <span style={{ color: "#D85A30" }}>*</span></label>
            <select style={inputStyle} value={form.semester}
              onChange={(e) => set("semester", e.target.value)}>
              <option value="">Select semester...</option>
              {["1st Semester","2nd Semester","3rd Semester"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {errors.semester && <p style={{ color: "#D85A30", fontSize: 12, marginTop: 3 }}>{errors.semester}</p>}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Skills Learned</label>
          <TagInput tags={form.skills} onChange={(v) => set("skills", v)} />
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            Press Enter or comma to add a skill
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose}
            style={{ height: 36, padding: "0 18px", borderRadius: 8, border: "1px solid #d1d5db", background: "transparent", cursor: "pointer", fontSize: 14 }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ height: 36, padding: "0 18px", borderRadius: 8, border: "1px solid #16a34a", background: "#f0fdf4", color: "#15803d", cursor: saving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 500, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Update Course"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}