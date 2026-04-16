import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/courseService';
import { buildGraphData } from '../utils/graphDataBuilder';
import { ReactFlow, Controls, Background, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CourseNode from '../components/map/CourseNode';
import CourseDetailPanel from '../components/map/CourseDetailPanel';

const nodeTypes = { courseNode: CourseNode };

export default function CurriculumMapPage() {
  const [courses, setCourses] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

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
      
      const { nodes: graphNodes, edges: graphEdges } = buildGraphData(result);
      setNodes(graphNodes);
      setEdges(graphEdges);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load curriculum data');
      setLoading(false);
    }
  };

  const handleNodeClick = (event, node) => {
    const course = courses.find(c => c.courseCode === node.id);
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
        zIndex: 10
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
              fontSize: '14px'
            }}
          >
            {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          background: '#f5f5f5'
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
          zIndex: 10
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
              marginLeft: '16px'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* React Flow Canvas */}
      {!loading && !error && nodes.length > 0 && (
        <ReactFlowProvider>
          <div style={{ height: "80vh", width: "100%", position: "relative" }}>
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

            {/* Course Detail Panel */}
            {selectedCourse && (
              <CourseDetailPanel
                course={selectedCourse}
                onClose={() => setSelectedCourse(null)}
              />
            )}
          </div>
        </ReactFlowProvider>
      )}

      {/* Empty State */}
      {!loading && !error && nodes.length === 0 && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          background: '#f5f5f5'
        }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p style={{ fontSize: '24px', marginBottom: '8px' }}>📚 No Courses Found</p>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Add courses to your Firestore 'courses' collection to see the curriculum map
            </p>
          </div>
        </div>
      )}
    </div>
  );
}