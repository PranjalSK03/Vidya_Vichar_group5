
import React, { useEffect, useState } from 'react';

const TeacherOverview = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/teacher/dashboard/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOverview(data.data);
        } else {
          setError(data.message || 'Failed to fetch overview');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!overview) return null;

  return (
    <div>
      <h1>Teaching Overview</h1>
      <p>Welcome, {overview.name}!</p>
      <div>
        <strong>Teacher ID:</strong> {overview.teacher_id}<br/>
        <strong>Email:</strong> {overview.username}<br/>
      </div>
      <div style={{marginTop:'1rem'}}>
        <strong>Courses:</strong> {overview.courses_id?.length || 0}<br/>
      </div>
    </div>
  );
};

export default TeacherOverview;