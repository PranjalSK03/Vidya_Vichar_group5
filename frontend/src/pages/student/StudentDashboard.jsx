import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api, apiRequest } from '../../config/api';

// Import separate component files
import StudentOverview from './StudentOverview.jsx';
import EnrolledCourses from './EnrolledCourses.jsx';
import PendingCourses from './PendingCourses.jsx';
import AvailableCourses from './AvailableCourses.jsx';
import StudentClasses from './StudentClasses.jsx';
import AnsweredDoubts from './AnsweredDoubts.jsx';
import JoinCourse from './JoinCourse.jsx';
import AttendedCourses from './AttendedCourses.jsx';
import CourseLectures from './CourseLectures.jsx';
import LectureDoubts from './LectureDoubts.jsx';
import JoinClass from './JoinClass.jsx';
import ClassDoubts from './ClassDoubts.jsx';

const StudentDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState('enrolled-courses'); // For My Courses subsection
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // Navigation state for attended courses flow
  const [attendedCoursesView, setAttendedCoursesView] = useState('courses'); // 'courses', 'lectures', 'doubts'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  
  // Navigation state for join class flow
  const [joinClassView, setJoinClassView] = useState('classes'); // 'classes', 'doubts'
  const [selectedClassLecture, setSelectedClassLecture] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('=== STUDENT DASHBOARD LOADED ===');
    console.log('Current location:', location.pathname);
    console.log('User:', userData?.name, '| Role:', localStorage.getItem('userRole'));
    
    // Check if auth bypass is enabled
    const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';
    console.log('Bypass auth enabled:', bypassAuth);
    
    if (bypassAuth) {
      console.log('Using auth bypass with mock data');
      
      // Set mock authentication data for API requests
      localStorage.setItem('userRole', 'student');
      localStorage.setItem('token', 'mock-jwt-token-for-development');
      localStorage.setItem('userData', JSON.stringify({
        id: 'STU001',
        name: 'John Doe',
        roll_no: '001',
        batch: 'B.Tech',
        branch: 'CSE',
        username: 'john.doe@university.edu',
        is_TA: false
      }));
      
      // Mock user data for development
      setUserData({
        id: 'STU001',
        name: 'John Doe',
        roll_no: '001',
        batch: 'B.Tech',
        branch: 'CSE',
        username: 'john.doe@university.edu',
        is_TA: false
      });
      setLoading(false);
      return;
    }

    // Check localStorage contents
    const userRole = localStorage.getItem('userRole');
    const storedUserData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');
    
    console.log('=== LOCALSTORAGE STATUS ===');
    console.log('userRole:', userRole);
    console.log('storedUserData exists:', !!storedUserData);
    console.log('storedUserData length:', storedUserData ? storedUserData.length : 0);
    console.log('token exists:', !!token);
    console.log('token preview:', token ? token.substring(0, 20) + '...' : 'None');
    console.log('Raw storedUserData:', storedUserData);
    
    // Check for cookie (if accessible)
    console.log('Document cookies:', document.cookie);

    // Add small delay to prevent race conditions during navigation
    const timeoutId = setTimeout(() => {
      console.log('=== AUTHENTICATION VALIDATION ===');
      
      // Check user role
      if (!userRole) {
        console.log('❌ No userRole found in localStorage');
        navigate('/student/login', { replace: true });
        return;
      }
      
      if (userRole !== 'student') {
        console.log('❌ User role is not student:', userRole);
        navigate('/student/login', { replace: true });
        return;
      }
      
      console.log('✅ User role is valid:', userRole);

      // Check user data
      if (!storedUserData || storedUserData === 'undefined' || storedUserData === 'null') {
        console.log('❌ No valid user data found in localStorage');
        navigate('/student/login', { replace: true });
        return;
      }

      // Parse user data
      try {
        const parsedUserData = JSON.parse(storedUserData);
        console.log('✅ Successfully parsed user data:', parsedUserData);
        
        // Validate required fields
        if (!parsedUserData.id || !parsedUserData.name) {
          console.log('❌ User data missing required fields:', {
            hasId: !!parsedUserData.id,
            hasName: !!parsedUserData.name,
            keys: Object.keys(parsedUserData)
          });
          navigate('/student/login', { replace: true });
          return;
        }
        
        console.log('✅ User data validation passed');
        console.log('✅ Setting user data and completing authentication');
        setUserData(parsedUserData);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
        console.log('Problematic data:', storedUserData);
        navigate('/student/login', { replace: true });
        return;
      }
    }, 200); // Increased delay to ensure stable navigation

    return () => {
      console.log('Cleaning up authentication timeout');
      clearTimeout(timeoutId);
    };
  }, [navigate, location.pathname]);

  // Fetch available courses when user data is available
  useEffect(() => {
    if (userData?.id) {
      fetchAvailableCourses();
    }
  }, [userData]);

  const fetchAvailableCourses = async () => {
    if (!userData?.id) return;
    
    setLoadingCourses(true);
    try {
      // Backend automatically filters by student's branch and batch from authentication
      const response = await api.student.getAllCourses();

      if (response.success && response.data && response.data.courses) {
        setAvailableCourses(response.data.courses);
      } else {
        console.error('Failed to fetch available courses:', response.message);
        setAvailableCourses([]);
      }
    } catch (error) {
      console.error('Error fetching available courses:', error);
      setAvailableCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side cookie using the API helper
      await apiRequest('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.log('Logout API call failed, but continuing with client-side cleanup');
    }
    
    // Clear client-side data
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    navigate('/');
  };

  // Navigation handlers for attended courses flow
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setAttendedCoursesView('lectures');
  };

  const handleLectureSelect = (lecture) => {
  setSelectedLecture(lecture._id);
  setAttendedCoursesView('doubts');
  };

  const handleBackToAttendedCourses = () => {
    setAttendedCoursesView('courses');
    setSelectedCourse(null);
    setSelectedLecture(null);
  };

  const handleBackToCourseLectures = () => {
    setAttendedCoursesView('lectures');
    setSelectedLecture(null);
  };

  // Navigation handlers for join class flow
  const handleClassJoined = (lecture) => {
  setSelectedClassLecture({ lectureId: lecture._id, lectureObj: lecture });
  setJoinClassView('doubts');
  };

  const handleBackToJoinClass = () => {
    setJoinClassView('classes');
    setSelectedClassLecture(null);
  };

  // Reset navigation when switching sections
  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section !== 'attended-courses') {
      setAttendedCoursesView('courses');
      setSelectedCourse(null);
      setSelectedLecture(null);
    }
    if (section !== 'join-class') {
      setJoinClassView('classes');
      setSelectedClassLecture(null);
    }
  };

  const renderSection = () => {
    switch(activeSection) {
      case 'overview': return <StudentOverview userData={userData} />;
      case 'my-courses': 
        // Handle My Courses subsections
        switch(activeSubSection) {
          case 'enrolled-courses': return <EnrolledCourses userData={userData} />;
          case 'pending-courses': return <PendingCourses userData={userData} />;
          case 'join-course': return <JoinCourse userData={userData} availableCourses={availableCourses} loadingCourses={loadingCourses} refreshCourses={fetchAvailableCourses} />;
          default: return <EnrolledCourses userData={userData} />;
        }
      case 'attended-courses':
        // Handle Attended Courses navigation flow
        switch(attendedCoursesView) {
          case 'lectures':
            return (
              <CourseLectures 
                userData={userData}
                selectedCourse={selectedCourse}
                onLectureSelect={lecture => {
                  setSelectedLecture(lecture._id);
                  setAttendedCoursesView('doubts');
                }}
                onBack={handleBackToAttendedCourses}
              />
            );
          case 'doubts':
            return (
              <LectureDoubts 
                userData={userData}
                lectureId={selectedLecture}
                selectedCourse={selectedCourse}
                onBack={handleBackToCourseLectures}
              />
            );
          default:
            return (
              <AttendedCourses 
                userData={userData}
                onCourseSelect={handleCourseSelect}
              />
            );
        }
      case 'join-class':
        // Handle Join Class navigation flow
        switch(joinClassView) {
          case 'doubts':
            return (
              <ClassDoubts 
                userData={userData}
                lectureId={selectedClassLecture?.lectureId}
                lectureObj={selectedClassLecture?.lectureObj}
                onBack={handleBackToJoinClass}
              />
            );
          default:
            return (
              <JoinClass 
                userData={userData}
                onClassJoined={handleClassJoined}
              />
            );
        }
      default: return <StudentOverview userData={userData} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col overflow-x-hidden">
      {/* Global background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-200/60 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tl from-purple-200/60 to-transparent blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand/logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white grid place-items-center shadow-sm">
                <span className="text-sm font-bold">VV</span>
              </div>
              <div className="leading-tight">
                <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Vidya Vichar</div>
                <div className="hidden sm:block text-[13px] text-slate-500">Student Dashboard</div>
              </div>
            </Link>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-slate-900">Welcome, {userData?.name || 'Student'}</div>
              <div className="text-xs text-slate-500">{userData?.universityId || 'Student ID'}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white/50 backdrop-blur border-r border-slate-200 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {/* Overview */}
            <button
              onClick={() => handleSectionChange('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeSection === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
              }`}
            >
              <span className="text-lg">📊</span>
              <span className="font-medium">Overview</span>
            </button>

            {/* My Courses - Expandable */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  if (activeSection === 'my-courses') {
                    // If already in My Courses, toggle between subsections or collapse
                    handleSectionChange('overview');
                  } else {
                    handleSectionChange('my-courses');
                    setActiveSubSection('enrolled-courses');
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeSection === 'my-courses'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
                }`}
              >
                <span className="text-lg">📚</span>
                <span className="font-medium">My Courses</span>
                <span className={`ml-auto text-sm transition-transform duration-200 ${
                  activeSection === 'my-courses' ? 'rotate-90' : ''
                }`}>▶</span>
              </button>

              {/* My Courses Subsections */}
              {activeSection === 'my-courses' && (
                <div className="ml-6 space-y-1">
                  <button
                    onClick={() => setActiveSubSection('enrolled-courses')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all duration-200 ${
                      activeSubSection === 'enrolled-courses'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span className="text-sm">📖</span>
                    <span className="font-medium">Enrolled Courses</span>
                  </button>
                  <button
                    onClick={() => setActiveSubSection('pending-courses')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all duration-200 ${
                      activeSubSection === 'pending-courses'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span className="text-sm">⏳</span>
                    <span className="font-medium">Pending Requests</span>
                  </button>
                  <button
                    onClick={() => setActiveSubSection('join-course')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all duration-200 ${
                      activeSubSection === 'join-course'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span className="text-sm">➕</span>
                    <span className="font-medium">Join New Course</span>
                  </button>
                </div>
              )}
            </div>

            {/* Attended Courses */}
            <button
              onClick={() => handleSectionChange('attended-courses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeSection === 'attended-courses'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
              }`}
            >
              <span className="text-lg">✅</span>
              <span className="font-medium">Attended Courses</span>
            </button>

            {/* Join Class */}
            <button
              onClick={() => handleSectionChange('join-class')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeSection === 'join-class'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
              }`}
            >
              <span className="text-lg">🏫</span>
              <span className="font-medium">Join Class</span>
            </button>
          </nav>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/60 backdrop-blur rounded-2xl border border-slate-200 shadow-sm min-h-[calc(100vh-8rem)] p-8">
              {renderSection()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
