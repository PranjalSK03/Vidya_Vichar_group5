import React, { useEffect, useState } from 'react';

const StudentLectures = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinMsg, setJoinMsg] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchLectures = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/student/dashboard/all-lectures', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setLectures(data.data);
        } else {
          setError(data.message || 'Failed to fetch lectures');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  const handleJoinLecture = async (lecture_id) => {
    setJoining(true);
    setJoinMsg('');
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/student/dashboard/join-lecture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lecture_id })
      });
      const data = await res.json();
      if (data.success) {
        setJoinMsg('Joined lecture!');
        // Optionally redirect to questions page for this lecture
      } else {
        setError(data.message || 'Failed to join lecture');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h1>Upcoming Lectures</h1>
      {joinMsg && <p style={{color:'green'}}>{joinMsg}</p>}
      {lectures.length === 0 ? <p>No upcoming lectures.</p> : (
        <ul>
          {lectures.map(lec => (
            <li key={lec._id}>
              <strong>{lec.lecture_title}</strong> ({lec.lecture_id})<br/>
              Course: {lec.course_id}<br/>
              Start: {new Date(lec.class_start).toLocaleString()}<br/>
              <button onClick={() => handleJoinLecture(lec.lecture_id)} disabled={joining}>Join Lecture</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentLectures;
