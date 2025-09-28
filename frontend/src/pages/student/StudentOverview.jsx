
import React, { useEffect, useState } from 'react';

const StudentOverview = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/student/dashboard/overview', {
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
      <h1>Student Overview</h1>
      <p>Welcome, {overview.name}!</p>
      <div>
        <strong>Roll No:</strong> {overview.roll_no}<br/>
        <strong>Batch:</strong> {overview.batch}<br/>
        <strong>Branch:</strong> {overview.branch}<br/>
      </div>
      <div style={{marginTop:'1rem'}}>
        <strong>Enrolled Courses:</strong> {overview.courses_id_enrolled?.length || 0}<br/>
        <strong>Pending Requests:</strong> {overview.courses_id_request?.length || 0}<br/>
        <strong>TA for:</strong> {overview.is_TA?.length || 0} courses<br/>
      </div>
    </div>
  );
};

export default StudentOverview;