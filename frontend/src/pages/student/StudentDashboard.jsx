
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Dashboard.css';
import EnrolledCourses from './EnrolledCourses';
import AvailableCourses from './AvailableCourses';
import PendingCourses from './PendingCourses';
import MyLectures from './MyLectures';
import PreviousLectures from './PreviousLectures';

const StudentDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if auth bypass is enabled
    const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';
    
    if (bypassAuth) {
      // Mock user data for development
      setUserData({
        name: 'John Doe',
        universityId: 'STU001',
        email: 'john.doe@university.edu',
        role: 'student'
      });
      setLoading(false);
    } else {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      const storedUserData = localStorage.getItem('userData');

      if (!token || userRole !== 'student') {
        navigate('/student/login');
        return;
      }

      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    navigate('/');
  };

  // Overview state
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState(null);

  // Fetch overview data when overview tab is active
  useEffect(() => {
    if (activeSection === 'overview') {
      const fetchOverview = async () => {
        setOverviewLoading(true);
        setOverviewError(null);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/users/student/dashboard/overview', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setOverview(data.data);
          } else {
            setOverviewError(data.message || 'Failed to fetch overview');
          }
        } catch (err) {
          setOverviewError('Network error');
        } finally {
          setOverviewLoading(false);
        }
      };
      fetchOverview();
    }
  }, [activeSection]);

  // Section rendering functions
  const renderOverview = () => {
    if (overviewLoading) return <div>Loading...</div>;
    if (overviewError) return <div style={{color:'red'}}>{overviewError}</div>;
    if (!overview) return <div>No overview data.</div>;
    return (
      <div>
        <h3>Student Overview</h3>
        <p>Welcome, {overview.name}!</p>
        <div><strong>Roll No:</strong> {overview.roll_no} | <strong>Batch:</strong> {overview.batch} | <strong>Branch:</strong> {overview.branch}</div>
        <div className="overview-stats">
          <div className="stat-card">
            <h4>Enrolled Courses</h4>
            <p>{overview.numCoursesEnrolled}</p>
          </div>
          <div className="stat-card">
            <h4>Pending Requests</h4>
            <p>{overview.pendingCourses}</p>
          </div>
          <div className="stat-card">
            <h4>Unanswered Questions</h4>
            <p>{overview.unansweredQuestions}</p>
          </div>
        </div>
      </div>
    );
  };

  // Use the real EnrolledCourses component for enrolled courses tab
  const renderEnrolledCourses = () => <EnrolledCourses />;

  // Use the real AvailableCourses component for available courses tab
  const renderAvailableCourses = () => <AvailableCourses />;
  const renderPendingCourses = () => <PendingCourses />;


  const renderSection = () => {
    switch(activeSection) {
      case 'overview': return renderOverview();
      case 'enrolled-courses': return renderEnrolledCourses();
      case 'available-courses': return renderAvailableCourses();
      case 'pending-courses': return renderPendingCourses();
      case 'my-lectures': return <MyLectures />;
      case 'previous-lectures': return <PreviousLectures />;
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <Link to="/" className="dashboard-logo">Vidya Vichar</Link>
            <span className="user-role">Student Dashboard</span>
          </div>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {userData?.name || 'Student'}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <div 
              onClick={() => setActiveSection('overview')} 
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              Overview
            </div>
            <div 
              onClick={() => setActiveSection('enrolled-courses')} 
              className={`nav-item ${activeSection === 'enrolled-courses' ? 'active' : ''}`}
            >
              <span className="nav-icon">📚</span>
              Enrolled Courses
            </div>
            <div 
              onClick={() => setActiveSection('available-courses')} 
              className={`nav-item ${activeSection === 'available-courses' ? 'active' : ''}`}
            >
              <span className="nav-icon">🔍</span>
              Available Courses
            </div>
            <div 
              onClick={() => setActiveSection('pending-courses')} 
              className={`nav-item ${activeSection === 'pending-courses' ? 'active' : ''}`}
            >
              <span className="nav-icon">⏳</span>
              Pending Courses
            </div>
            <div 
              onClick={() => setActiveSection('my-lectures')} 
              className={`nav-item ${activeSection === 'my-lectures' ? 'active' : ''}`}
            >
              <span className="nav-icon">📝</span>
              My Lectures
            </div>
            <div 
              onClick={() => setActiveSection('previous-lectures')} 
              className={`nav-item ${activeSection === 'previous-lectures' ? 'active' : ''}`}
            >
              <span className="nav-icon">📂</span>
              Previous Lectures
            </div>
          </nav>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-section">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
