import React, { useEffect, useState } from 'react';

const TA = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all courses for dropdown
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/teacher/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch {}
    };
    fetchCourses();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/teacher/course/make-ta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: selectedCourse, roll_no: rollNo })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Student added as TA!');
        setRollNo('');
      } else {
        setError(data.message || 'Failed to add TA');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Assign TA</h1>
      {error && <p style={{color:'red'}}>{error}</p>}
      {message && <p style={{color:'green'}}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Select Course: </label>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required>
          <option value="">--Select--</option>
          {courses.map(c => (
            <option key={c._id} value={c.course_id}>{c.course_name} ({c.course_id})</option>
          ))}
        </select>
        <input value={rollNo} onChange={e => setRollNo(e.target.value)} placeholder="Student Roll No" required />
        <button type="submit" disabled={loading}>Add as TA</button>
      </form>
    </div>
  );
};

export default TA;
