import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Dashboard.css';

const TeacherDashboard = () => {
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
        name: 'Dr. Jane Smith',
        teacherId: 'TEACH001',
        email: 'jane.smith@university.edu',
        role: 'teacher'
      });
      setLoading(false);
    } else {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      const storedUserData = localStorage.getItem('userData');

      if (!token || userRole !== 'teacher') {
        navigate('/teacher/login');
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

  // Section rendering functions
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState(null);

  useEffect(() => {
    if (activeSection === 'overview') {
      const fetchOverview = async () => {
        setOverviewLoading(true);
        setOverviewError(null);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/users/teacher/dashboard/overview', {
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

  const renderOverview = () => {
    if (overviewLoading) return <div>Loading...</div>;
    if (overviewError) return <div style={{color:'red'}}>{overviewError}</div>;
    if (!overview) return <div>No overview data.</div>;
    return (
      <div>
        <h3>Teacher Overview</h3>
        <p>Welcome, {overview.name}!</p>
        <div className="overview-stats">
          <div className="stat-card">
            <h4>Total Courses</h4>
            <p>{overview.courses_id?.length || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Total Pending Requests</h4>
            <p>{overview.total_pending_requests}</p>
          </div>
        </div>
        <div style={{marginTop:'1em'}}>
          <b>Teacher ID:</b> {overview.teacher_id}<br/>
          <b>Username:</b> {overview.username}
        </div>
      </div>
    );
  };

  const renderYourCourses = () => (
    <div>
      <h3>Your Courses</h3>
      <p>Manage and view all your courses</p>
      <div className="course-list">
        <div className="course-card">Mathematics 101</div>
        <div className="course-card">Physics 201</div>
        <div className="course-card">Chemistry 301</div>
      </div>
    </div>
  );

  const renderCreateCourse = () => (
    <div>
      <h3>Create New Course</h3>
      <p>Create a new course for your students</p>
      <form className="create-form">
        <input type="text" placeholder="Course Name" />
        <input type="text" placeholder="Course Code" />
        <textarea placeholder="Course Description"></textarea>
        <button type="submit" className="primary-btn">Create Course</button>
      </form>
    </div>
  );

  const renderCreateClass = () => (
    <div>
      <h3>Create New Class</h3>
      <p>Schedule a new class session</p>
      <form className="create-form">
        <input type="text" placeholder="Class Title" />
        <input type="datetime-local" placeholder="Date & Time" />
        <textarea placeholder="Class Description"></textarea>
        <button type="submit" className="primary-btn">Create Class</button>
      </form>
    </div>
  );

  const renderClassPage = () => (
    <div>
      <h3>Class Page</h3>
      <p>Manage your class sessions and materials</p>
      <div className="class-list">
        <div className="class-item">
          <h4>Mathematics - Algebra</h4>
          <p>Today, 10:00 AM</p>
        </div>
        <div className="class-item">
          <h4>Physics - Mechanics</h4>
          <p>Tomorrow, 2:00 PM</p>
        </div>
      </div>
    </div>
  );

  const renderJoinedStudents = () => (
    <div>
      <h3>Joined Students</h3>
      <p>View all students enrolled in your courses</p>
      <div className="student-list">
        <div className="student-item">
          <h4>John Doe</h4>
          <p>Mathematics 101</p>
        </div>
        <div className="student-item">
          <h4>Jane Smith</h4>
          <p>Physics 201</p>
        </div>
      </div>
    </div>
  );

  const renderAllDoubts = () => (
    <div>
      <h3>All Doubts</h3>
      <p>View all student questions and doubts</p>
      <div className="doubt-list">
        <div className="doubt-item">
          <h4>Question about Integration</h4>
          <p>From: John Doe | Subject: Mathematics</p>
        </div>
        <div className="doubt-item">
          <h4>Physics Lab Procedure</h4>
          <p>From: Jane Smith | Subject: Physics</p>
        </div>
      </div>
    </div>
  );

  const renderUnansweredDoubts = () => (
    <div>
      <h3>Unanswered Doubts</h3>
      <p>Questions waiting for your response</p>
      <div className="doubt-list">
        <div className="doubt-item urgent">
          <h4>Chemistry Equation Balancing</h4>
          <p>From: Alice Johnson | Posted: 2 hours ago</p>
          <button className="primary-btn">Answer</button>
        </div>
      </div>
    </div>
  );

  const renderAnsweredDoubts = () => (
    <div>
      <h3>Answered Doubts</h3>
      <p>Previously answered student questions</p>
      <div className="doubt-list">
        <div className="doubt-item answered">
          <h4>Calculus Derivative</h4>
          <p>From: Bob Wilson | Answered: Yesterday</p>
        </div>
      </div>
    </div>
  );

  const renderCourseDetails = () => (
    <div>
      <h3>Course Details</h3>
      <p>Detailed information about your courses</p>
      <div className="course-details">
        <h4>Mathematics 101</h4>
        <p>Students: 45 | Duration: 16 weeks</p>
        <p>Next Class: Monday, 10:00 AM</p>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div>
      <h3>Teacher Profile</h3>
      <p>Manage your profile information</p>
      <div className="profile-info">
        <p><strong>Name:</strong> {userData?.name}</p>
        <p><strong>Teacher ID:</strong> {userData?.teacherId}</p>
        <p><strong>Email:</strong> {userData?.email}</p>
        <button className="primary-btn">Edit Profile</button>
      </div>
    </div>
  );

  // Placeholder renderers for new tabs
  // Courses tab state
  const [allTeachers, setAllTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseError, setCourseError] = useState(null);
  const [form, setForm] = useState({ course_id: '', course_name: '', batch: '', branch: '', valid_time: '', teacher_ids: [] });
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [batchOptions, setBatchOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);

  // Fetch all teachers and courses when tab is active
  useEffect(() => {
    if (activeSection === 'courses') {
      const fetchData = async () => {
        setCourseLoading(true);
        setCourseError(null);
        try {
          const token = localStorage.getItem('token');
          // Fetch all teachers for dropdown
          const tRes = await fetch('/api/users/teacher/all', { headers: { 'Authorization': `Bearer ${token}` } });
          const tData = await tRes.json();
          if (tData.success) setAllTeachers(tData.data.teachers);
          // Fetch teacher's own courses
          const cRes = await fetch('/api/users/teacher/courses', { headers: { 'Authorization': `Bearer ${token}` } });
          const cData = await cRes.json();
          if (cData.success) setCourses(cData.data.courses);
        } catch (err) {
          setCourseError('Network error');
        } finally {
          setCourseLoading(false);
        }
      };
      fetchData();
    }
  }, [activeSection, creating]);

  // Fetch batch/branch options from backend
  useEffect(() => {
    if (activeSection === 'courses') {
      const fetchOptions = async () => {
        try {
          const batchRes = await fetch('/api/auth/student/batch-options');
          const branchRes = await fetch('/api/auth/student/branch-options');
          const batchData = await batchRes.json();
          const branchData = await branchRes.json();
          if (batchData.success && Array.isArray(batchData.options)) setBatchOptions(batchData.options);
          if (branchData.success && Array.isArray(branchData.options)) setBranchOptions(branchData.options);
        } catch {}
      };
      fetchOptions();
    }
  }, [activeSection]);

  const handleFormChange = e => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      setForm(f => ({ ...f, [name]: Array.from(selectedOptions, o => o.value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleCreateCourse = async e => {
    e.preventDefault();
    setCreating(true);
    setSuccessMsg('');
    setCourseError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/teacher/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Course created successfully!');
        setForm({ course_id: '', course_name: '', batch: '', branch: '', valid_time: '', teacher_ids: [] });
        // Fetch updated courses list
        const cRes = await fetch('/api/users/teacher/courses', { headers: { 'Authorization': `Bearer ${token}` } });
        const cData = await cRes.json();
        if (cData.success) setCourses(cData.data.courses);
      } else {
        setCourseError(data.message || 'Failed to create course');
      }
    } catch (err) {
      setCourseError('Network error');
    } finally {
      setCreating(false);
    }
  };

  const renderCourses = () => (
    <div>
      <h3>📚 Courses</h3>
      <form className="create-form" onSubmit={handleCreateCourse} style={{marginBottom:'2em'}}>
        <input name="course_id" value={form.course_id} onChange={handleFormChange} type="text" placeholder="Course ID" required />
        <input name="course_name" value={form.course_name} onChange={handleFormChange} type="text" placeholder="Course Name" required />
        <select name="batch" value={form.batch} onChange={handleFormChange} className="tab-select" required>
          <option value="">-- Select Batch --</option>
          {batchOptions.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select name="branch" value={form.branch} onChange={handleFormChange} className="tab-select" required>
          <option value="">-- Select Branch --</option>
          {branchOptions.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <input name="valid_time" value={form.valid_time} onChange={handleFormChange} type="date" placeholder="Valid Time" required className="tab-select" />
        <label>Add Co-Teachers:</label>
        <select name="teacher_ids" multiple value={form.teacher_ids} onChange={handleFormChange} className="tab-select">
          {allTeachers.map(t => (
            <option key={t.teacher_id} value={t.teacher_id}>{t.name} ({t.teacher_id})</option>
          ))}
        </select>
        <button type="submit" className="primary-btn" disabled={creating}>Add Course</button>
      </form>
      {successMsg && <div style={{color:'green'}}>{successMsg}</div>}
      {courseError && <div style={{color:'red'}}>{courseError}</div>}
      {courseLoading ? <p>Loading...</p> : (
        <div>
          <h4>Your Courses</h4>
          {courses.length === 0 ? <p>No courses found.</p> : (
            <ul>
              {courses.map(c => (
                <li key={c.course_id}><b>{c.course_name}</b> ({c.course_id})</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
  // TA tab state
  const [taCourses, setTaCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [taMsg, setTaMsg] = useState('');
  const [taError, setTaError] = useState('');
  const [taLoading, setTaLoading] = useState(false);

  useEffect(() => {
    if (activeSection === 'ta') {
      const fetchCourses = async () => {
        setTaLoading(true);
        setTaError('');
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/users/teacher/courses', { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (data.success) setTaCourses(data.data.courses);
        } catch (err) {
          setTaError('Network error');
        } finally {
          setTaLoading(false);
        }
      };
      fetchCourses();
    }
  }, [activeSection, taMsg]);

  const handleAddTA = async e => {
    e.preventDefault();
    setTaMsg('');
    setTaError('');
    setTaLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/teacher/course/make-ta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ course_id: selectedCourse, roll_no: rollNo })
      });
      const data = await res.json();
      if (data.success) {
        setTaMsg('TA added successfully!');
        setRollNo('');
      } else {
        setTaError(data.message || 'Failed to add TA');
      }
    } catch (err) {
      setTaError('Network error');
    } finally {
      setTaLoading(false);
    }
  };

  const renderTA = () => (
    <div className="tab-section">
      <h3 className="tab-title">🧑‍🏫 TA Management</h3>
      <form onSubmit={handleAddTA} className="create-form" style={{marginBottom:'2em'}}>
        <div className="tab-row">
          <label className="tab-label">Select Course:</label>
          <select className="tab-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required>
            <option value="">-- Select --</option>
            {taCourses.map(c => (
              <option key={c.course_id} value={c.course_id}>{c.course_name} ({c.course_id})</option>
            ))}
          </select>
        </div>
        <div className="tab-row">
          <label className="tab-label">Student Roll No.:</label>
          <input className="tab-input" type="text" placeholder="Student Roll No." value={rollNo} onChange={e => setRollNo(e.target.value)} required />
        </div>
        <button type="submit" className="primary-btn" disabled={taLoading}>Add TA</button>
      </form>
      {taMsg && <div className="tab-success">{taMsg}</div>}
      {taError && <div className="tab-error">{taError}</div>}
    </div>
  );
  // Requests tab state
  const [reqCourses, setReqCourses] = useState([]);
  const [selectedReqCourse, setSelectedReqCourse] = useState('');
  const [requests, setRequests] = useState([]);
  const [reqMsg, setReqMsg] = useState('');
  const [reqError, setReqError] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  useEffect(() => {
    if (activeSection === 'requests') {
      const fetchCourses = async () => {
        setReqLoading(true);
        setReqError('');
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/users/teacher/courses', { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (data.success) setReqCourses(data.data.courses);
        } catch (err) {
          setReqError('Network error');
        } finally {
          setReqLoading(false);
        }
      };
      fetchCourses();
    }
  }, [activeSection, reqMsg]);

  useEffect(() => {
    if (activeSection === 'requests' && selectedReqCourse) {
      const fetchRequests = async () => {
        setReqLoading(true);
        setReqError('');
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/users/teacher/course/${selectedReqCourse}/pending-requests`, { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (data.success) setRequests(data.data.requests || []);
          else setRequests([]);
        } catch (err) {
          setReqError('Network error');
        } finally {
          setReqLoading(false);
        }
      };
      fetchRequests();
    }
  }, [activeSection, selectedReqCourse, reqMsg]);

  const handleAccept = async (student_id) => {
    setReqMsg('');
    setReqError('');
    setReqLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/teacher/course/accept-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ course_id: selectedReqCourse, student_ids: [student_id] })
      });
      const data = await res.json();
      if (data.success) setReqMsg('Request accepted!');
      else setReqError(data.message || 'Failed to accept request');
    } catch (err) {
      setReqError('Network error');
    } finally {
      setReqLoading(false);
    }
  };

  const handleAcceptAll = async () => {
    setReqMsg('');
    setReqError('');
    setReqLoading(true);
    try {
      const token = localStorage.getItem('token');
      const student_ids = requests.map(r => r.student_id);
      const res = await fetch('/api/users/teacher/course/accept-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ course_id: selectedReqCourse, student_ids })
      });
      const data = await res.json();
      if (data.success) setReqMsg('All requests accepted!');
      else setReqError(data.message || 'Failed to accept all requests');
    } catch (err) {
      setReqError('Network error');
    } finally {
      setReqLoading(false);
    }
  };

  const renderRequests = () => (
    <div>
      <h3>Student Join Requests</h3>
      <label>Select Course:</label>
      <select value={selectedReqCourse} onChange={e => setSelectedReqCourse(e.target.value)} required>
        <option value="">-- Select --</option>
        {reqCourses.map(c => (
          <option key={c.course_id} value={c.course_id}>{c.course_name} ({c.course_id})</option>
        ))}
      </select>
      {reqLoading && <p>Loading...</p>}
      {reqMsg && <div style={{color:'green'}}>{reqMsg}</div>}
      {reqError && <div style={{color:'red'}}>{reqError}</div>}
      {selectedReqCourse && !reqLoading && (
        <div style={{marginTop:'1em'}}>
          <button onClick={handleAcceptAll} className="primary-btn" disabled={requests.length === 0}>Accept All</button>
          <h4>Pending Requests</h4>
          {requests.length === 0 ? <p>No pending requests.</p> : (
            <ul>
              {requests.map(r => (
                <li key={r.student_id}>
                  <b>{r.student_name}</b> ({r.student_id})
                  <button style={{marginLeft:'1em'}} onClick={() => handleAccept(r.student_id)}>Accept</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
  // Lectures tab state
  const [lecCourses, setLecCourses] = useState([]);
  const [selectedLecCourse, setSelectedLecCourse] = useState('');
  const [currentLecture, setCurrentLecture] = useState(null);
  const [lecQuestions, setLecQuestions] = useState([]);
  const [lecMsg, setLecMsg] = useState('');
  const [lecError, setLecError] = useState('');
  const [lecLoading, setLecLoading] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answeringQ, setAnsweringQ] = useState(null);

  useEffect(() => {
    if (activeSection === 'lectures') {
      const fetchCourses = async () => {
        setLecLoading(true);
        setLecError('');
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/users/teacher/courses', { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (data.success) setLecCourses(data.data.courses);
        } catch (err) {
          setLecError('Network error');
        } finally {
          setLecLoading(false);
        }
      };
      fetchCourses();
    }
  }, [activeSection, lecMsg]);

  useEffect(() => {
    if (activeSection === 'lectures' && selectedLecCourse) {
      const fetchCurrentLecture = async () => {
        setLecLoading(true);
        setLecError('');
        try {
          const token = localStorage.getItem('token');
          // Fetch all lectures for course, filter for current
          const res = await fetch(`/api/users/teacher/course/${selectedLecCourse}/lectures`, { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (data.success && data.data.lectures) {
            const now = Date.now();
            const curr = data.data.lectures.find(l => new Date(l.class_start) <= now && now <= new Date(l.class_end));
            setCurrentLecture(curr || null);
            if (curr) {
              // Fetch questions for this lecture
              const qRes = await fetch(`/api/users/teacher/lecture/${curr.lecture_id}/questions`, { headers: { 'Authorization': `Bearer ${token}` } });
              const qData = await qRes.json();
              if (qData.success) setLecQuestions(qData.data.questions);
              else setLecQuestions([]);
            } else {
              setLecQuestions([]);
            }
          } else {
            setCurrentLecture(null);
            setLecQuestions([]);
          }
        } catch (err) {
          setLecError('Network error');
        } finally {
          setLecLoading(false);
        }
      };
      fetchCurrentLecture();
    }
  }, [activeSection, selectedLecCourse, lecMsg]);

  const handleMark = async (question_id, type) => {
    setLecMsg(''); setLecError(''); setLecLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/teacher/question/${question_id}/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.success) setLecMsg('Updated!');
      else setLecError(data.message || 'Failed to update');
    } catch (err) {
      setLecError('Network error');
    } finally {
      setLecLoading(false);
    }
  };

  const handleAnswer = async (question_id) => {
    setLecMsg(''); setLecError(''); setLecLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/teacher/question/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question_id, answer: answerText })
      });
      const data = await res.json();
      if (data.success) {
        setLecMsg('Answer added!');
        setAnswerText('');
        setAnsweringQ(null);
      } else setLecError(data.message || 'Failed to add answer');
    } catch (err) {
      setLecError('Network error');
    } finally {
      setLecLoading(false);
    }
  };

  const renderLectures = () => (
    <div className="tab-section">
      <h3 className="tab-title">📢 Current Lecture</h3>
      <div className="tab-row">
        <label className="tab-label">Select Course:</label>
        <select className="tab-select" value={selectedLecCourse} onChange={e => setSelectedLecCourse(e.target.value)} required>
          <option value="">-- Select --</option>
          {lecCourses.map(c => (
            <option key={c.course_id} value={c.course_id}>{c.course_name} ({c.course_id})</option>
          ))}
        </select>
      </div>
      {lecLoading && <div className="tab-loading">Loading...</div>}
      {lecMsg && <div className="tab-success">{lecMsg}</div>}
      {lecError && <div className="tab-error">{lecError}</div>}
      {selectedLecCourse && currentLecture && !lecLoading && (
        <div className="lecture-card">
          <h4 className="lecture-title">{currentLecture.lecture_title} <span className="lecture-id">({currentLecture.lecture_id})</span></h4>
          <div className="lecture-time">Start: {new Date(currentLecture.class_start).toLocaleString()} | End: {new Date(currentLecture.class_end).toLocaleString()}</div>
          <h5 className="questions-title">Questions</h5>
          {lecQuestions.length === 0 ? <p className="tab-empty">No questions yet.</p> : (
            <ul className="questions-list">
              {lecQuestions.map(q => (
                <li key={q.question_id} className="question-card">
                  <div className="question-header">
                    <b>{q.question_text}</b> <span className="question-meta">(by {q.student_id})</span>
                  </div>
                  <div className="question-tags">
                    {q.is_important && <span className="tag-important">⭐ Important</span>}
                    {q.is_answered && <span className="tag-answered">✅ Answered</span>}
                  </div>
                  <div className="question-actions">
                    <button className="tab-btn" onClick={()=>handleMark(q.question_id,'important')}>Mark Important</button>
                    <button className="tab-btn" onClick={()=>handleMark(q.question_id,'answered')}>Mark Answered</button>
                    <button className="tab-btn" onClick={()=>setAnsweringQ(q.question_id)}>Add Answer</button>
                  </div>
                  {answeringQ===q.question_id && (
                    <form className="answer-form" onSubmit={e=>{e.preventDefault();handleAnswer(q.question_id);}}>
                      <input className="tab-input" value={answerText} onChange={e=>setAnswerText(e.target.value)} placeholder="Type answer..." required />
                      <button className="tab-btn" type="submit">Submit</button>
                      <button className="tab-btn tab-btn-cancel" type="button" onClick={()=>setAnsweringQ(null)}>Cancel</button>
                    </form>
                  )}
                  {q.answer && q.answer.length > 0 && (
                    <div className="answers-section">
                      <b>Answers:</b>
                      <ul className="answers-list">
                        {q.answer.map(a => (
                          <li key={a.answer_id}><b>{a.answerer_name}:</b> {a.answer}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {selectedLecCourse && !currentLecture && !lecLoading && <p className="tab-empty">No current lecture for this course.</p>}
    </div>
  );
  // Previous Lectures tab state
  const [prevCourses, setPrevCourses] = useState([]);
  const [selectedPrevCourse, setSelectedPrevCourse] = useState('');
  const [prevLectures, setPrevLectures] = useState([]);
  const [selectedPrevLecture, setSelectedPrevLecture] = useState('');
  const [prevQuestions, setPrevQuestions] = useState([]);
  const [prevMsg, setPrevMsg] = useState('');
  const [prevError, setPrevError] = useState('');
  const [prevLoading, setPrevLoading] = useState(false);

  useEffect(() => {
    if (activeSection === 'previous-lectures') {
      const fetchCourses = async () => {
        setPrevLoading(true);
        setPrevError('');
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/users/teacher/courses', { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (data.success) setPrevCourses(data.data.courses);
        } catch (err) {
          setPrevError('Network error');
        } finally {
          setPrevLoading(false);
        }
      };
      fetchCourses();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'previous-lectures' && selectedPrevCourse) {
      const fetchPrevLectures = async () => {
        setPrevLoading(true);
        setPrevError('');
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/users/teacher/course/${selectedPrevCourse}/lectures`, { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (data.success && data.data.lectures) {
            const now = Date.now();
            const prev = data.data.lectures.filter(l => new Date(l.class_end) < now);
            setPrevLectures(prev);
          } else setPrevLectures([]);
        } catch (err) {
          setPrevError('Network error');
        } finally {
          setPrevLoading(false);
        }
      };
      fetchPrevLectures();
    }
  }, [activeSection, selectedPrevCourse]);

  useEffect(() => {
    if (activeSection === 'previous-lectures' && selectedPrevLecture) {
      const fetchQuestions = async () => {
        setPrevLoading(true);
        setPrevError('');
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/users/teacher/lecture/${selectedPrevLecture}/questions`, { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (data.success) setPrevQuestions(data.data.questions);
          else setPrevQuestions([]);
        } catch (err) {
          setPrevError('Network error');
        } finally {
          setPrevLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [activeSection, selectedPrevLecture]);

  const renderPrevLectures = () => (
    <div className="tab-section">
      <h3 className="tab-title">📚 Previous Lectures</h3>
      <div className="tab-row">
        <label className="tab-label">Select Course:</label>
        <select className="tab-select" value={selectedPrevCourse} onChange={e => {setSelectedPrevCourse(e.target.value);setSelectedPrevLecture('');}} required>
          <option value="">-- Select --</option>
          {prevCourses.map(c => (
            <option key={c.course_id} value={c.course_id}>{c.course_name} ({c.course_id})</option>
          ))}
        </select>
        {selectedPrevCourse && (
          <>
            <label className="tab-label" style={{marginLeft:'1em'}}>Select Lecture:</label>
            <select className="tab-select" value={selectedPrevLecture} onChange={e => setSelectedPrevLecture(e.target.value)} required>
              <option value="">-- Select --</option>
              {prevLectures.map(l => (
                <option key={l.lecture_id} value={l.lecture_id}>{l.lecture_title} ({new Date(l.class_start).toLocaleString()})</option>
              ))}
            </select>
          </>
        )}
      </div>
      {prevLoading && <div className="tab-loading">Loading...</div>}
      {prevMsg && <div className="tab-success">{prevMsg}</div>}
      {prevError && <div className="tab-error">{prevError}</div>}
      {selectedPrevLecture && !prevLoading && (
        <div className="lecture-card">
          <h4 className="questions-title">Questions & Answers</h4>
          {prevQuestions.length === 0 ? <p className="tab-empty">No questions for this lecture.</p> : (
            <ul className="questions-list">
              {prevQuestions.map(q => (
                <li key={q.question_id} className="question-card">
                  <div className="question-header">
                    <b>{q.question_text}</b> <span className="question-meta">(by {q.student_id})</span>
                  </div>
                  <div className="question-tags">
                    {q.is_important && <span className="tag-important">⭐ Important</span>}
                    {q.is_answered && <span className="tag-answered">✅ Answered</span>}
                  </div>
                  {q.answer && q.answer.length > 0 && (
                    <div className="answers-section">
                      <b>Answers:</b>
                      <ul className="answers-list">
                        {q.answer.map(a => (
                          <li key={a.answer_id}><b>{a.answerer_name}:</b> {a.answer}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );

  const renderSection = () => {
    switch(activeSection) {
      case 'overview': return renderOverview();
      case 'courses': return renderCourses();
      case 'ta': return renderTA();
      case 'requests': return renderRequests();
      case 'lectures': return renderLectures();
      case 'previous-lectures': return renderPrevLectures();
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
            <span className="user-role">Teacher Dashboard</span>
          </div>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {userData?.name || 'Teacher'}</span>
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
              onClick={() => setActiveSection('courses')} 
              className={`nav-item ${activeSection === 'courses' ? 'active' : ''}`}
            >
              <span className="nav-icon">📚</span>
              Courses
            </div>
            <div 
              onClick={() => setActiveSection('ta')} 
              className={`nav-item ${activeSection === 'ta' ? 'active' : ''}`}
            >
              <span className="nav-icon">🧑‍🏫</span>
              TA
            </div>
            <div 
              onClick={() => setActiveSection('requests')} 
              className={`nav-item ${activeSection === 'requests' ? 'active' : ''}`}
            >
              <span className="nav-icon">📥</span>
              Requests
            </div>
            <div 
              onClick={() => setActiveSection('lectures')} 
              className={`nav-item ${activeSection === 'lectures' ? 'active' : ''}`}
            >
              <span className="nav-icon">📢</span>
              Lectures
            </div>
            <div 
              onClick={() => setActiveSection('previous-lectures')} 
              className={`nav-item ${activeSection === 'previous-lectures' ? 'active' : ''}`}
            >
              <span className="nav-icon">📚</span>
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

export default TeacherDashboard;
