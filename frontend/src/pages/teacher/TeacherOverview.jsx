import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../config/api';

const TeacherOverview = ({ overviewData, loading }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [loadingLiveClasses, setLoadingLiveClasses] = useState(true);

  useEffect(() => {
    fetchTeacherCourses();
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      setLoadingLiveClasses(true);
      
      // Always send teacher_id as query param for reliability
      let teacherId = null;
      // Try to get teacherId from localStorage userData
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        teacherId = userData?.teacher_id;
      } catch {}
      const endpoint = teacherId
        ? `/users/teacher/live-classes?teacher_id=${teacherId}`
        : '/users/teacher/live-classes';
      const response = await apiRequest(endpoint);
      
      if (response.success && response.data) {
        // Filter out classes that are ended by teacher
        const activeLiveClasses = response.data.filter(liveClass => !liveClass.is_teacher_ended);
        setLiveClasses(activeLiveClasses);
        console.log('✅ Live classes fetched successfully:', activeLiveClasses);
      } else {
        console.error('Failed to fetch live classes:', response.message);
        setLiveClasses([]);
      }
    } catch (error) {
      console.error('Error fetching live classes:', error);
      setLiveClasses([]);
    } finally {
      setLoadingLiveClasses(false);
    }
  };

  const handleJoinLiveClass = (lectureData) => {
    // This will be handled by parent component (TeacherDashboard)
    console.log('🎉 Joining live class from overview:', lectureData);
    // We need to communicate with parent to handle class joining
    if (window.handleJoinFromOverview) {
      window.handleJoinFromOverview(lectureData);
    }
  };

  const fetchTeacherCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await apiRequest('/users/teacher/courses/detailed');
      
      if (response.success) {
        setCourses(response.data || []);
      } else {
        console.error('Failed to fetch courses:', response.message);
        // Keep empty array, don't show mock data
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Keep empty array on error
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchPendingRequests = async (courseId) => {
    try {
      setLoadingRequests(true);
      const response = await apiRequest(`/users/teacher/course/${courseId}/pending-requests`);
      
      if (response.success && response.data) {
        // Handle the correct response structure from backend
        const pendingStudents = response.data.pending_students || [];
        
        // Transform the data to match frontend expectations
        const formattedRequests = pendingStudents.map(student => ({
          request_id: student.id,
          student_id: student.id,
          student_name: student.name,
          student_email: student.username || student.email || 'No email',
          batch: 'N/A', // Backend doesn't return batch info
          branch: 'N/A', // Backend doesn't return branch info
          requested_at: new Date(),
          student_profile: {
            semester: 'N/A',
            cgpa: 'N/A'
          }
        }));
        
        setPendingRequests(formattedRequests);
      } else {
        console.log('API returned unsuccessful response:', response);
        setPendingRequests([]);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setPendingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    fetchPendingRequests(course.course_id);
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      setProcessingRequest(requestId);
      const response = await apiRequest(`/users/teacher/course-request/${requestId}/${action}`, {
        method: 'POST'
      });
      
      if (response.success) {
        // Remove the processed request from the list
        setPendingRequests(prev => prev.filter(req => req.request_id !== requestId));
        
        // Update the course's pending request count
        setCourses(prev => prev.map(course => 
          course.course_id === selectedCourse.course_id 
            ? { ...course, pending_requests: Math.max(0, course.pending_requests - 1) }
            : course
        ));
      } else {
        alert(`Failed to ${action} request: ${response.message}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      alert(`Error ${action}ing request. Please try again.`);
    } finally {
      setProcessingRequest(null);
    }
  };

  if (loading || loadingCourses) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading overview...</p>
        </div>
      </div>
    );
  }

  // Show pending requests view when a course is selected
  if (selectedCourse) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedCourse(null)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Courses
            </button>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
          <h1 className="text-2xl font-bold mb-2">{selectedCourse.course_name}</h1>
          <p className="text-indigo-100 mb-4">{selectedCourse.description}</p>
          <div className="flex items-center gap-6 text-sm">
            <span>📚 {selectedCourse.course_id}</span>
            <span>🎓 {selectedCourse.batch}</span>
            <span>👥 {selectedCourse.students_enrolled} enrolled</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Pending Join Requests ({pendingRequests.length})
            </h2>
            {pendingRequests.length > 0 && (
              <div className="text-sm text-slate-500">
                Review and approve student requests
              </div>
            )}
          </div>

          {loadingRequests ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-slate-600">Loading requests...</p>
            </div>
          ) : (!Array.isArray(pendingRequests) || pendingRequests.length === 0) ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No pending requests</h3>
              <p className="text-slate-500">All join requests have been processed for this course.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(pendingRequests) && pendingRequests.map((request) => (
                <div key={request.request_id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium">
                          {request.student_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{request.student_name}</h4>
                          <p className="text-sm text-slate-500">{request.student_email}</p>
                        </div>
                      </div>
                      
                      <div className="ml-13 space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-4">
                          <span>🎓 {request.batch}</span>
                          <span>📊 CGPA: {request.student_profile.cgpa}</span>
                          <span>📅 {request.student_profile.semester} Semester</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Requested: {request.requested_at.toLocaleDateString()} at {request.requested_at.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleRequestAction(request.request_id, 'accept')}
                        disabled={processingRequest === request.request_id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {processingRequest === request.request_id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Accept
                      </button>
                      
                      <button
                        onClick={() => handleRequestAction(request.request_id, 'deny')}
                        disabled={processingRequest === request.request_id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {processingRequest === request.request_id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        Deny
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default overview showing all courses
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back, Teacher! 👋
        </h1>
        <p className="text-slate-600">
          Here's your dashboard overview. Monitor active classes and manage course requests below.
        </p>
      </div>

      {/* Active Classes Display */}
      {!loadingLiveClasses && liveClasses.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">� Active Classes</h3>
                <p className="text-sm text-slate-600">Currently running class sessions</p>
              </div>
            </div>
            <button
              onClick={fetchLiveClasses}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="space-y-4">
            {liveClasses.map((liveClass) => {
              // Determine class status like in student JoinClass component
              const now = new Date();
              const startTime = new Date(liveClass.class_start);
              const endTime = new Date(liveClass.class_end);
              
              let classStatus = {};
              if (now < startTime) {
                classStatus = { status: 'upcoming', color: 'bg-blue-100 text-blue-800', text: 'Upcoming', buttonColor: 'bg-gray-400 cursor-not-allowed', borderColor: 'border-blue-200' };
              } else if (now >= startTime && now <= endTime) {
                classStatus = { status: 'live', color: 'bg-green-100 text-green-800', text: 'Live Now', buttonColor: 'bg-green-600 hover:bg-green-700', borderColor: 'border-green-200' };
              } else {
                classStatus = { status: 'ended', color: 'bg-orange-100 text-orange-800', text: 'Recently Ended', buttonColor: 'bg-orange-600 hover:bg-orange-700', borderColor: 'border-orange-200' };
              }

              return (
                <div 
                  key={liveClass.lecture_id} 
                  className={`bg-white border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${classStatus.borderColor}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-xl font-semibold text-slate-900">{liveClass.lecture_title}</h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${classStatus.color}`}>
                          {classStatus.status === 'live' && (
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                              {classStatus.text}
                            </span>
                          )}
                          {classStatus.status !== 'live' && classStatus.text}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-slate-600 text-sm mb-1">
                            <span className="font-medium">Course:</span> {liveClass.course_name}
                          </p>
                          <p className="text-slate-600 text-sm">
                            <span className="font-medium">Code:</span> {liveClass.course_id}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-slate-600 text-sm mb-1">
                            <span className="font-medium">Lecture:</span> #{liveClass.lec_num}
                          </p>
                          <p className="text-slate-600 text-sm">
                            <span className="font-medium">Students Joined:</span> {liveClass.students_joined}/{liveClass.total_students}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>🗓️ {startTime.toLocaleDateString()}</span>
                        <span>⏰ {startTime.toLocaleTimeString()} - {endTime.toLocaleTimeString()}</span>
                        {classStatus.status === 'live' && (
                          <span className="text-green-600 font-medium">🔴 Live Session</span>
                        )}
                        {classStatus.status === 'ended' && (
                          <span className="text-orange-600">📚 Ended - Still Accessible</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      {classStatus.status === 'live' && (
                        <span className="text-green-600 font-medium">🎥 Your class is running</span>
                      )}
                      {classStatus.status === 'ended' && (
                        <span className="text-orange-600">📋 Manage questions and attendance</span>
                      )}
                      {classStatus.status === 'upcoming' && (
                        <span className="text-blue-600">⏰ Class will start soon</span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleJoinLiveClass(liveClass)}
                      disabled={classStatus.status === 'upcoming'}
                      className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium text-white flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${classStatus.buttonColor}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {classStatus.status === 'upcoming' && 'Class Not Started'}
                      {classStatus.status === 'live' && 'Join Live Class'}
                      {classStatus.status === 'ended' && 'Manage Class'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200 text-center">
            <p className="text-sm text-slate-600">
              ℹ️ <strong>Active Classes:</strong> These are your currently running lecture sessions.
            </p>
          </div>
        </div>
      )}

      {/* Loading state for live classes */}
      {loadingLiveClasses && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-slate-600">Checking for active classes...</span>
            </div>
          </div>
        </div>
      )}

      {/* No active classes message */}
      {!loadingLiveClasses && liveClasses.length === 0 && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Live Classes Right Now</h3>
          <p className="text-slate-500 mb-4">You don't have any live classes available to join at the moment.</p>
          <button
            onClick={() => {
              // Navigate to create lecture section - will be handled by parent
              if (window.navigateToCreateLecture) {
                window.navigateToCreateLecture();
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Create New Lecture
          </button>
        </div>
      )}

      {/* Live Classes Info Section */}
      {liveClasses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Live Classes Information</h4>
              <div className="text-blue-800 space-y-2">
                <p className="text-sm">• <strong>Live:</strong> Classes currently in progress - join to interact with students</p>
                <p className="text-sm">• <strong>Upcoming:</strong> Scheduled classes starting soon - prepare your materials</p>
                <p className="text-sm">• <strong>Ended:</strong> Recently finished classes - check recordings and feedback</p>
                <p className="text-sm">• You can join live classes multiple times if you need to step out temporarily</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Your Courses</h2>
          <div className="text-sm text-slate-500">
            {courses.length} course{courses.length !== 1 ? 's' : ''} total
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-6">You haven't been assigned to any courses</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div 
                key={course.course_id} 
                onClick={() => handleCourseClick(course)}
                className="border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 bg-white cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                      {course.course_name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">{course.course_id}</p>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{course.description}</p>
                  </div>
                  {course.pending_requests > 0 && (
                    <div className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full">
                      {course.pending_requests}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Batch:</span>
                    <span className="font-medium text-slate-700">{course.batch}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Branch:</span>
                    <span className="font-medium text-slate-700">{course.branch}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-indigo-600">{course.students_enrolled || 0}</div>
                      <div className="text-xs text-slate-500">Enrolled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">{course.pending_requests || 0}</div>
                      <div className="text-xs text-slate-500">Pending</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                  <span className="text-sm text-indigo-600 font-medium group-hover:text-indigo-800 transition-colors">
                    Click to manage requests →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherOverview;