
import React, { useEffect, useState } from 'react';

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
  const res = await fetch('/api/users/student/dashboard/enrolled-courses', {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h1>Enrolled Courses</h1>
      {courses.length === 0 ? <p>No enrolled courses.</p> : (
        <ul>
          {courses.map((course) => (
            <li key={course.id}>
              <strong>{course.course_name}</strong><br/>
              Instructor: {course.instructor}<br/>
              Duration: {course.duration !== null ? (course.duration / (1000*60*60*24)).toFixed(1) + ' days' : 'N/A'}<br/>
              Remaining Time: {course.remainingTime !== null ? (course.remainingTime > 0 ? (course.remainingTime / (1000*60*60*24)).toFixed(1) + ' days' : 'Ended') : 'N/A'}<br/>
              TAs: {course.TAs && course.TAs.length > 0 ? course.TAs.map(ta => ta.name + ' (' + ta.roll_no + ')').join(', ') : 'None'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EnrolledCourses;