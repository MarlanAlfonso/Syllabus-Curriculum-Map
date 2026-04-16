// src/pages/CurriculumMapPage.jsx

import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/courseService';
import { buildGraphData, getFilterOptions } from '../utils/graphDataBuilder';
import { ReactFlow, Controls, Background, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CourseNode from '../components/map/CourseNode';
import CourseDetailPanel from '../components/map/CourseDetailPanel';

const nodeTypes = { courseNode: CourseNode };

const DEFAULT_FILTERS = {
  yearLevel: null,
  semester: null,
  skill: null,
  department: null,
};

export default function CurriculumMapPage() {
  const [courses, setCourses] = useState([]);         // raw full list — never filtered
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterOptions, setFilterOptions] = useState({
    yearLevels: [],
    semesters: [],
    departments: [],
    skills: [],
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  // Re-build graph whenever filters change (courses must already be loaded)
  useEffect(() => {
    if (courses.length === 0) return;
    const { nodes: graphNodes, edges: graphEdges } = buildGraphData(courses, filters);
    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [filters, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getCourses();

      if (!result || result.length === 0) {
        setError('No courses found in Firestore');
        setCourses([]);
        setNodes([]);
        setEdges([]);
        setLoading(false);
        return;
      }

      setCourses(result);
      setFilterOptions(getFilterOptions(result));

      const { nodes: graphNodes, edges: graphEdges } = buildGraphData(result, filters);
      setNodes(graphNodes);
      setEdges(graphEdges);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load curriculum data');
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleNodeClick = (event, node) => {
    const course = courses.find((c) => c.courseCode === node.id);
    setSelectedCourse(course || null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        background: '#2c3e50',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>Curriculum Map</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
              {courses.length} courses • Prerequisites and dependencies visualized
            </p>
          </div>
          <button
            onClick={fetchCourses}
            disabled={loading}
            style={{
              padding: '10px 16px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: '14px',
            }}
          >
            {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </div>

      {/* ── TASK 2 — Filter Panel ── */}
      {!loading && !error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 20px',
          background: '#f0f4f8',
          borderBottom: '1px solid #dde3ea',
          flexWrap: 'wrap',
        }}>

          {/* Year Level */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            Year Level:
            <select
              value={filters.yearLevel ?? ''}
              onChange={(e) =>
                handleFilterChange('yearLevel', e.target.value ? Number(e.target.value) : null)
              }
              style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">All</option>
              {(filterOptions.yearLevels.length > 0
                ? filterOptions.yearLevels
                : [1, 2, 3, 4]
              ).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>

          {/* Semester */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            Semester:
            <select
              value={filters.semester ?? ''}
              onChange={(e) =>
                handleFilterChange('semester', e.target.value || null)
              }
              style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">All</option>
              {(filterOptions.semesters.length > 0
                ? filterOptions.semesters
                : ['1st', '2nd', 'Summer']
              ).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          {/* Skills Tag */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            Skills Tag:
            <input
              type="text"
              placeholder="e.g. data-structures"
              value={filters.skill ?? ''}
              onChange={(e) =>
                handleFilterChange('skill', e.target.value || null)
              }
              style={{
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '160px',
              }}
            />
          </label>

          {/* Department */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            Department:
            <select
              value={filters.department ?? ''}
              onChange={(e) =>
                handleFilterChange('department', e.target.value || null)
              }
              style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">All</option>
              {(filterOptions.departments.length > 0
                ? filterOptions.departments
                : ['CS', 'IT', 'IS']
              ).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>

          {/* ── TASK 3 — Clear Filters ── */}
          <button
            onClick={handleClearFilters}
            style={{
              padding: '6px 14px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginLeft: 'auto',
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: '#f5f5f5',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⟳</div>
            <p style={{ fontSize: '16px', color: '#666' }}>Loading curriculum data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          padding: '20px',
          background: '#fee',
          borderBottom: '1px solid #fcc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}>
          <div>
            <p style={{ margin: 0, color: '#c33', fontWeight: 'bold' }}>❌ Error: {error}</p>
            <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
              Check that Firestore collection 'courses' exists and contains data
            </p>
          </div>
          <button
            onClick={fetchCourses}
            style={{
              padding: '8px 16px',
              background: '#c33',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginLeft: '16px',
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* React Flow Canvas */}
      {!loading && !error && nodes.length > 0 && (
        <ReactFlowProvider>
          <div style={{ flex: 1, width: '100%', position: 'relative' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={handleNodeClick}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>

            {selectedCourse && (
              <CourseDetailPanel
                course={selectedCourse}
                onClose={() => setSelectedCourse(null)}
              />
            )}
          </div>
        </ReactFlowProvider>
      )}

      {/* Empty State — no results after filtering */}
      {!loading && !error && nodes.length === 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: '#f5f5f5',
        }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p style={{ fontSize: '24px', marginBottom: '8px' }}>
              {courses.length > 0 ? '🔍 No Matching Courses' : '📚 No Courses Found'}
            </p>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {courses.length > 0
                ? 'Try adjusting or clearing your filters'
                : "Add courses to your Firestore 'courses' collection to see the curriculum map"}
            </p>
            {courses.length > 0 && (
              <button
                onClick={handleClearFilters}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}