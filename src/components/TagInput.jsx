import { useState, useRef } from "react";

const SKILL_SUGGESTIONS = [
  "Critical Thinking", "Programming", "Communication", "Problem Solving",
  "Teamwork", "Data Analysis", "Research", "Leadership", "Project Management",
  "Database Management", "Web Development", "Networking", "Mathematics",
  "Technical Writing", "Public Speaking", "Time Management", "Algorithms",
  "Software Design", "Object-Oriented Programming", "Systems Analysis",
];

export default function TagInput({ tags = [], onChange }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef();

  const addTag = (val) => {
    const trimmed = val.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
    setSuggestions([]);
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (val.trim()) {
      const matches = SKILL_SUGGESTIONS.filter(
        (s) => s.toLowerCase().includes(val.toLowerCase()) && !tags.includes(s.toLowerCase())
      ).slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          border: "1px solid #d1d5db",
          borderRadius: 8,
          padding: "8px 10px",
          minHeight: 80,
          cursor: "text",
          background: "#fff",
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "flex-start",
        }}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "#dbeafe",
              color: "#1d4ed8",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 13,
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#1d4ed8",
                fontSize: 16,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setSuggestions([]), 150)}
          placeholder={
            tags.length === 0
              ? "Type a skill and press Enter (e.g., Critical Thinking, Programming, Communication)"
              : "Add more..."
          }
          style={{
            border: "none",
            outline: "none",
            fontSize: 13,
            flex: 1,
            minWidth: 180,
            background: "transparent",
          }}
        />
      </div>

      {suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            zIndex: 999,
            width: "100%",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            background: "#fff",
            marginTop: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          {suggestions.map((s, i) => (
            <div
              key={i}
              onMouseDown={() => addTag(s)}
              style={{
                padding: "8px 12px",
                fontSize: 13,
                cursor: "pointer",
                color: "#374151",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#f3f4f6")}
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}