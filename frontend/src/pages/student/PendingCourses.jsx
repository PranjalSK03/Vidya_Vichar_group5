import React, { useEffect, useState } from 'react';

const PendingCourses = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/student/dashboard/pending-courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setPending(data.data.courses || []);
        } else {
          setError(data.message || 'Failed to fetch pending courses');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h1>Pending Course Requests</h1>
      {pending.length === 0 ? <p>No pending requests.</p> : (
        <ul>
          {pending.map((course) => (
            <li key={course.id}>
              <strong>{course.course_name}</strong><br/>
              Instructor: {course.instructor}<br/>
              {course.TAs && course.TAs.length > 0 && (
                <span>TA(s): {course.TAs.map(ta => `${ta.name} (${ta.roll_no})`).join(', ')}<br/></span>
              )}
              {course.duration && <span>Duration: {Math.round(course.duration/3600000)} hrs<br/></span>}
              {course.remainingTime && <span>Time Left: {Math.max(0, Math.round(course.remainingTime/3600000))} hrs<br/></span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingCourses;
