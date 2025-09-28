
import React, { useEffect, useState } from 'react';

const AvailableCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
  const res = await fetch('/api/users/student/dashboard/all-courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data.courses)) {
          setCourses(data.data.courses);
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


  function handleJoin(courseId) {
    const token = localStorage.getItem('token');
    fetch('/api/users/student/dashboard/join-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ course_id: courseId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Course join request sent!');
        } else {
          alert(data.message || 'Failed to join course');
        }
      })
      .catch(() => alert('Network error'));
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;


  return (
    <div>
      <h1>Available Courses</h1>
      {courses.length === 0 ? <p>No available courses.</p> : (
        <ul>
          {courses.map((course) => (
            <li key={course.id}>
              <strong>{course.name}</strong> ({course.id})
              <button style={{marginLeft:'1rem'}} onClick={() => handleJoin(course.id)}>Join</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AvailableCourses;