
import React, { useState, useEffect } from 'react';

const JoinCourse = () => {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/student/dashboard/all-courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
        } else {
          setError(data.message || 'Failed to fetch courses');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!selected) return setMessage('Please select a course');
    setLoading(true);
    setMessage('');
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/student/dashboard/join-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: selected })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Request sent!');
      } else {
        setError(data.message || 'Failed to join course');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Join Course</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      {message && <p style={{color:'green'}}>{message}</p>}
      <form onSubmit={handleJoin}>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Select a course</option>
          {courses.map(course => (
            <option key={course._id} value={course.course_id}>{course.course_name} ({course.course_id})</option>
          ))}
        </select>
        <button type="submit" disabled={loading}>Join</button>
      </form>
    </div>
  );
};

export default JoinCourse;