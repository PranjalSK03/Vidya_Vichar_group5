import React, { useEffect, useState } from 'react';

const Requests = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    if (!selectedCourse) return;
    // Fetch pending requests for selected course
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      setMessage('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/teacher/course/${selectedCourse}/pending-requests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setRequests(data.data);
        } else {
          setError(data.message || 'Failed to fetch requests');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [selectedCourse]);

  const handleAccept = async (student_id) => {
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/teacher/course/accept-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: selectedCourse, student_ids: [student_id] })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Request accepted!');
        setRequests(reqs => reqs.filter(r => r._id !== student_id));
      } else {
        setError(data.message || 'Failed to accept request');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAll = async () => {
    if (requests.length === 0) return;
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/teacher/course/accept-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: selectedCourse, student_ids: requests.map(r => r._id) })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('All requests accepted!');
        setRequests([]);
      } else {
        setError(data.message || 'Failed to accept all requests');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (student_id) => {
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/teacher/course/reject-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: selectedCourse, student_ids: [student_id] })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Request rejected!');
        setRequests(reqs => reqs.filter(r => r._id !== student_id));
      } else {
        setError(data.message || 'Failed to reject request');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Course Requests</h1>
      {error && <p style={{color:'red'}}>{error}</p>}
      {message && <p style={{color:'green'}}>{message}</p>}
      <label>Select Course: </label>
      <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
        <option value="">--Select--</option>
        {courses.map(c => (
          <option key={c._id} value={c.course_id}>{c.course_name} ({c.course_id})</option>
        ))}
      </select>
      {loading && <p>Loading...</p>}
      {selectedCourse && requests.length > 0 && (
        <button onClick={handleAcceptAll} disabled={loading}>Accept All</button>
      )}
      <ul>
        {requests.map(r => (
          <li key={r._id}>
            <strong>{r.name}</strong> ({r.roll_no})<br/>
            <button onClick={() => handleAccept(r._id)} disabled={loading}>Accept</button>
            <button onClick={() => handleReject(r._id)} disabled={loading}>Reject</button>
          </li>
        ))}
      </ul>
      {selectedCourse && requests.length === 0 && !loading && <p>No pending requests for this course.</p>}
    </div>
  );
};

export default Requests;
