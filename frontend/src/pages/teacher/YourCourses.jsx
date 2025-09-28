
import React, { useEffect, useState } from 'react';

const YourCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/teacher/courses', {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h1>Your Courses</h1>
      {courses.length === 0 ? <p>No courses found.</p> : (
        <ul>
          {courses.map(course => (
            <li key={course._id}>
              <strong>{course.course_name}</strong> ({course.course_id})<br/>
              Batch: {course.batch}, Branch: {course.branch}<br/>
              Teachers: {course.teacher_id?.join(', ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default YourCourses;