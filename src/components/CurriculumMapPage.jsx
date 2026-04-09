import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/courseService';

export default function CurriculumMapPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Step 1: Test if getCourses exists
      console.log('🔍 STEP 1: Calling getCourses()...');
      alert('🔍 STEP 1: Calling getCourses()...');
      
      const result = await getCourses();
      
      // Step 2: Check what we got back
      console.log('📦 STEP 2: Result from getCourses():', result);
      alert('📦 STEP 2: Got result with length: ' + (result ? result.length : 'null'));
      
      if (!result) {
        setError('getCourses() returned null');
        setDebugInfo('getCourses() returned null or undefined');
        setLoading(false);
        return;
      }

      if (result.length === 0) {
        setError('No courses found in Firestore');
        setDebugInfo('getCourses() returned empty array []');
        setCourses([]);
        setLoading(false);
        return;
      }

      // Step 3: Log first course to verify structure
      console.log('🎓 STEP 3: First course:', result[0]);
      alert('✅ STEP 3: First course code = ' + (result[0]?.courseCode || 'MISSING'));

      setCourses(result);
      setDebugInfo(`Successfully loaded ${result.length} courses`);
      setLoading(false);
    } catch (err) {
      console.error('❌ ERROR in fetchCourses:', err);
      alert('❌ ERROR: ' + err.message);
      setError(err.message);
      setDebugInfo(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  // DEBUG: Show what's in state
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔍 CURRICULUM MAP — DEBUG MODE</h1>
      
      {/* Status Section */}
      <div style={{ 
        background: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h3>Status:</h3>
        <p><strong>Loading:</strong> {String(loading)}</p>
        <p><strong>Error:</strong> {error || 'None'}</p>
        <p><strong>Number of courses:</strong> {courses.length}</p>
        <p><strong>Debug Info:</strong> {debugInfo}</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '5px' }}>
          <p>⏳ Loading courses...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '5px' }}>
          <p>❌ Error: {error}</p>
          <button onClick={fetchCourses} style={{ padding: '8px 16px', marginTop: '10px' }}>
            🔄 Retry
          </button>
        </div>
      )}

      {/* No Courses State */}
      {!loading && !error && courses.length === 0 && (
        <div style={{ background: '#d1ecf1', padding: '15px', borderRadius: '5px' }}>
          <p>📭 No courses returned from Firestore</p>
          <p>Check Firebase Console → Firestore → courses collection</p>
        </div>
      )}

      {/* Courses List - RAW TABLE */}
      {!loading && !error && courses.length > 0 && (
        <div>
          <h2>✅ Courses Found: {courses.length}</h2>
          <table border="1" cellPadding="10" style={{ width: '100%', marginTop: '20px' }}>
            <thead>
              <tr style={{ background: '#3b82f6', color: 'white' }}>
                <th>Code</th>
                <th>Title</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Units</th>
                <th>Prerequisites</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, idx) => (
                <tr key={course.id || idx}>
                  <td><strong>{course.courseCode || '⚠️ MISSING'}</strong></td>
                  <td>{course.courseTitle || '⚠️ MISSING'}</td>
                  <td>{course.yearLevel || '⚠️ MISSING'}</td>
                  <td>{course.semester || '⚠️ MISSING'}</td>
                  <td>{course.units || '⚠️ MISSING'}</td>
                  <td>{course.prerequisites?.join(', ') || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Raw JSON for verification */}
          <h3 style={{ marginTop: '30px' }}>Raw JSON (First Course):</h3>
          <pre style={{ 
            background: '#f4f4f4', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto'
          }}>
            {JSON.stringify(courses[0], null, 2)}
          </pre>
        </div>
      )}

      {/* Manual Refresh Button */}
      <button 
        onClick={fetchCourses} 
        style={{ 
          padding: '10px 20px', 
          marginTop: '20px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        🔄 Refresh Data
      </button>
    </div>
  );
}