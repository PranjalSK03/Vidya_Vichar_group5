import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyLectures = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLectures = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/student/dashboard/all-lectures', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setLectures(data.data.lectures || []);
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

  const handleJoin = (lecture) => {
    navigate(`/student/join-lecture/${lecture.lecture_id}`);
  };

  return (
    <div>
      <h2>My Lectures</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{color:'red'}}>{error}</p>
      ) : lectures.length === 0 ? (
        <p>No upcoming lectures.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Lecture Title</th>
              <th>Start</th>
              <th>End</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {lectures.map(lec => (
              <tr key={lec.lecture_id}>
                <td>{lec.course_name}</td>
                <td>{lec.lecture_title}</td>
                <td>{new Date(lec.class_start).toLocaleString()}</td>
                <td>{new Date(lec.class_end).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleJoin(lec)}>Join Lecture</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default MyLectures;
