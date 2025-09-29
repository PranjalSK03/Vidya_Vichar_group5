import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../config/api';

const ClassPage = ({ lectureData, userData, onBack, showAsLiveClass = false, onShowAsLiveClass }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'answered', 'unanswered'
  const [lectureInfo, setLectureInfo] = useState(lectureData || null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  useEffect(() => {
    if (lectureInfo) {
      fetchQuestions();
    }
  }, [lectureInfo, filter]);

  const fetchQuestions = async () => {
    if (!lectureInfo?._id) return;
    try {
      setLoading(true);
      const endpoint = `/users/teacher/lecture/${lectureInfo._id}/questions`;
      console.log('🔍 ClassPage fetchQuestions: API call to:', endpoint);
      
      try {
        const response = await apiRequest(endpoint);
        console.log('🔍 ClassPage fetchQuestions API response:', response);
        console.log('🔍 ClassPage response.data type:', typeof response.data);
        console.log('🔍 ClassPage response.data isArray:', Array.isArray(response.data));
        console.log('🔍 ClassPage response.data content:', response.data);
        
        if (response.success) {
          let fetchedQuestions = response.data || [];
          
          // Handle different API response structures
          if (response.data && Array.isArray(response.data.questions)) {
            fetchedQuestions = response.data.questions;
          } else if (response.data && Array.isArray(response.data)) {
            fetchedQuestions = response.data;
          } else {
            // If data is not in expected format, use empty array
            fetchedQuestions = [];
          }
          
          console.log('🔍 ClassPage fetchedQuestions:', fetchedQuestions);
          
          // Apply filter to fetched questions
          if (filter === 'answered') {
            fetchedQuestions = fetchedQuestions.filter(q => q.is_answered);
          } else if (filter === 'unanswered') {
            fetchedQuestions = fetchedQuestions.filter(q => !q.is_answered);
          }
          
          setQuestions(fetchedQuestions);
          return;
        }
      } catch (apiError) {
        console.log('🔍 ClassPage Questions API failed, using fallback data:', apiError.message);
      }
      
      // Fallback mock data if API fails
      const mockQuestions = [
        {
          question_id: 'Q001',
          question_text: `What are the key concepts covered in "${lectureInfo.lecture_title}"?`,
          student_name: 'John Doe',
          lecture_title: lectureInfo.lecture_title,
          course_name: lectureInfo.course_id,
          timestamp: new Date('2024-09-25T10:30:00'),
          is_answered: true,
          answer_count: 2
        },
        {
          question_id: 'Q002',
          question_text: `Can you provide more examples related to "${lectureInfo.lecture_title}"?`,
          student_name: 'Jane Smith',
          lecture_title: lectureInfo.lecture_title,
          course_name: lectureInfo.course_id,
          timestamp: new Date('2024-09-25T11:00:00'),
          is_answered: false,
          answer_count: 0
        },
        {
          question_id: 'Q003',
          question_text: `I'm confused about a specific part of "${lectureInfo.lecture_title}". Could you clarify?`,
          student_name: 'Mike Johnson',
          lecture_title: lectureInfo.lecture_title,
          course_name: lectureInfo.course_id,
          timestamp: new Date('2024-09-25T11:15:00'),
          is_answered: false,
          answer_count: 0
        }
      ];
      
      let filteredQuestions = mockQuestions;
      if (filter === 'answered') {
        filteredQuestions = mockQuestions.filter(q => q.is_answered);
      } else if (filter === 'unanswered') {
        filteredQuestions = mockQuestions.filter(q => !q.is_answered);
      }
      
      setQuestions(filteredQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getStatusColor = (isAnswered) => {
    return isAnswered 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (isAnswered) => {
    return isAnswered ? 'Answered' : 'Pending';
  };

  const isClassLive = () => {
    if (!lectureInfo) return false;
    const now = new Date();
    const startTime = new Date(lectureInfo.class_start);
    const endTime = new Date(lectureInfo.class_end);
    return now >= startTime && now <= endTime;
  };

  const getClassStatus = () => {
    if (!lectureInfo) return 'Unknown';
    const now = new Date();
    const startTime = new Date(lectureInfo.class_start);
    const endTime = new Date(lectureInfo.class_end);
    
    if (now < startTime) return 'Scheduled';
    if (now >= startTime && now <= endTime) return 'Live Now';
    if (now > endTime) return 'Completed';
    return 'Unknown';
  };

  const getFilterCounts = () => {
    // Safety check to ensure questions is always an array
    const questionsArray = Array.isArray(questions) ? questions : [];
    const all = questionsArray.length;
    const answered = questionsArray.filter(q => q.is_answered).length;
    const unanswered = questionsArray.filter(q => !q.is_answered).length;
    return { all, answered, unanswered };
  };

  const handleAnswerQuestion = (question) => {
    setSelectedQuestion(question);
    setAnswerText('');
    setShowAnswerModal(true);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedQuestion || !answerText.trim()) {
      alert('Please enter an answer before submitting.');
      return;
    }

    try {
      setSubmittingAnswer(true);
      
      // Debug: Check token status
      console.log('🔍 Current token in localStorage:', localStorage.getItem('token'));
      console.log('🔍 Current userRole in localStorage:', localStorage.getItem('userRole'));
      
      // Force set the token if missing (development fix)
      if (!localStorage.getItem('token')) {
        console.log('🔧 Setting mock token for development');
        localStorage.setItem('token', 'mock-jwt-token-for-development');
        localStorage.setItem('userRole', 'teacher');
      }
      
      const response = await apiRequest('/users/teacher/question/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: selectedQuestion.question_id,
          answer_text: answerText.trim(),
          answer_type: 'text'
        })
      });

      if (response.success) {
        // Close modal
        setShowAnswerModal(false);
        setSelectedQuestion(null);
        setAnswerText('');
        
        // Refresh questions to show the updated answer
        await fetchQuestions();
        
        alert('Answer submitted successfully!');
      } else {
        throw new Error(response.message || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert(`Failed to submit answer: ${error.message}`);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleCancelAnswer = () => {
    setShowAnswerModal(false);
    setSelectedQuestion(null);
    setAnswerText('');
  };

  const handleJoinClass = () => {
    if (isClassLive() || getClassStatus() === 'Scheduled') {
      // Switch to normal ClassPage view to manage the live class
      if (onShowAsLiveClass && typeof onShowAsLiveClass === 'function') {
        onShowAsLiveClass(false);
      }
      // Refresh questions for the live class
      fetchQuestions();
    }
  };

  const handleEndLecture = async () => {
    if (!lectureInfo?.lecture_id) return;

    const confirmEnd = window.confirm(
      `Are you sure you want to end the lecture "${lectureInfo.lecture_title}"? This action cannot be undone and students will no longer be able to join the class.`
    );

    if (!confirmEnd) return;

    try {
      setLoading(true);
      
      const response = await apiRequest('/users/teacher/lecture/end', {
        method: 'POST',
        body: JSON.stringify({
          lecture_id: lectureInfo.lecture_id
        })
      });

      if (response.success) {
        // Update lecture info to reflect that it's ended
        setLectureInfo(prev => ({
          ...prev,
          is_teacher_ended: true,
          teacher_ended_at: new Date().toISOString()
        }));

        alert('Lecture ended successfully!');
        
        // Optionally go back to dashboard or refresh data
        if (onBack) {
          onBack();
        }
      } else {
        alert('Failed to end lecture: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error ending lecture:', error);
      alert('Failed to end lecture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!lectureInfo) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No lecture selected</h3>
        <p className="text-slate-500">Select a lecture to view its questions and doubts.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading lecture questions...</p>
        </div>
      </div>
    );
  }

  const filterCounts = getFilterCounts();

  return (
    <div className="space-y-6">
      {showAsLiveClass ? (
        /* Live Class Card */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 text-sm font-medium"
              >
                ← Back
              </button>
            )}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">Join Live Class</h1>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                🔄 Refresh
              </button>
            </div>
            <p className="text-slate-600 mt-1">Join ongoing or recent classes from your enrolled courses</p>
          </div>

          {/* Live Class Info */}
          <div className="p-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{lectureInfo.lecture_title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      isClassLive() ? 'bg-green-100 text-green-800' : 
                      getClassStatus() === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {isClassLive() ? '🔴 Live Now' : getClassStatus()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                    <div>
                      <span className="font-medium">Course Code:</span> {lectureInfo.course_id}
                    </div>
                    <div>
                      <span className="font-medium">Lecture:</span> {lectureInfo.lec_num || 1}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {lectureInfo.class_start && new Date(lectureInfo.class_start).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {
                        lectureInfo.class_start && lectureInfo.class_end && (
                          `${new Date(lectureInfo.class_start).toLocaleTimeString()} - ${new Date(lectureInfo.class_end).toLocaleTimeString()}`
                        )
                      }
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      👥 {lectureInfo.students_joined || 0} students joined
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  {isClassLive() && (
                    <span className="flex items-center gap-1">
                      🎥 Class is live now
                    </span>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleJoinClass}
                    className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    disabled={!isClassLive() && getClassStatus() !== 'Scheduled'}
                  >
                    {isClassLive() ? 'Join Live Class' : getClassStatus() === 'Scheduled' ? 'Join When Live' : 'Class Ended'}
                  </button>
                  
                  {(isClassLive() || getClassStatus() === 'Live Now') && !lectureInfo.is_teacher_ended && (
                    <button 
                      onClick={handleEndLecture}
                      className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      disabled={loading}
                    >
                      🛑 End Lecture
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* How to Join Classes Section */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 How to Join Classes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Classes appear here when they're live or about to start</li>
                <li>• Click "Join Live Class" when the class is active</li>
                <li>• You'll be taken to the class interface to manage questions and interact with students</li>
                <li>• Students can ask questions during the live session</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Class Questions View */
        <>
          {/* Header with lecture info and back button */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 text-sm font-medium"
                >
                  ← Back
                </button>
              )}
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Class Questions & Doubts</h1>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-700">{lectureInfo.lecture_title}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>📚 Course: {lectureInfo.course_id}</span>
                    {lectureInfo.class_start && (
                      <span>📅 {new Date(lectureInfo.class_start).toLocaleDateString()}</span>
                    )}
                    {lectureInfo.class_start && lectureInfo.class_end && (
                      <span>
                        🕒 {new Date(lectureInfo.class_start).toLocaleTimeString()} - 
                        {new Date(lectureInfo.class_end).toLocaleTimeString()}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isClassLive() ? 'bg-green-100 text-green-800' : 
                      getClassStatus() === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {getClassStatus()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Questions ({filterCounts.all})
            </button>
            <button
              onClick={() => setFilter('unanswered')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unanswered' 
                  ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pending ({filterCounts.unanswered})
            </button>
            <button
              onClick={() => setFilter('answered')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'answered' 
                  ? 'bg-green-100 text-green-700 ring-2 ring-green-500' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Answered ({filterCounts.answered})
            </button>
          </div>

          {/* Questions list */}
          {!Array.isArray(questions) || questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {filter === 'all' 
                  ? 'No questions yet' 
                  : filter === 'answered'
                  ? 'No answered questions'
                  : 'No pending questions'
                }
              </h3>
              <p className="text-slate-500">
                {filter === 'all'
                  ? 'Students haven\'t asked any questions during this lecture yet.'
                  : filter === 'answered'
                  ? 'No questions have been answered yet.'
                  : 'All questions have been answered!'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(questions) && questions.map((question) => (
                <div key={question.question_id} className="border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-200 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(question.is_answered)}`}>
                          {getStatusText(question.is_answered)}
                        </span>
                        <span className="text-sm text-slate-500">
                          by {question.student_name}
                        </span>
                        <span className="text-sm text-slate-400">•</span>
                        <span className="text-sm text-slate-500">
                          {formatTimeAgo(question.timestamp)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {question.question_text}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {question.answer_count} answer{question.answer_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors">
                        View Details
                      </button>
                      {!question.is_answered && (
                        <button 
                          onClick={() => handleAnswerQuestion(question)}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-sm hover:bg-indigo-700 rounded-lg transition-colors"
                        >
                          Answer Question
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )) || []}
            </div>
          )}
        </>
      )}

      {/* Answer Modal */}
      {showAnswerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Answer Question</h2>
              <button 
                onClick={handleCancelAnswer}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedQuestion && (
              <div className="mb-6">
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Student Question:</h3>
                  <p className="text-slate-700">{selectedQuestion.question_text}</p>
                  <div className="mt-2 text-sm text-slate-500">
                    Asked by {selectedQuestion.student_name} • {formatTimeAgo(selectedQuestion.timestamp)}
                  </div>
                </div>

                <div>
                  <label htmlFor="answerText" className="block text-sm font-medium text-slate-700 mb-2">
                    Your Answer:
                  </label>
                  <textarea
                    id="answerText"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical"
                    placeholder="Type your detailed answer here..."
                    disabled={submittingAnswer}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={handleCancelAnswer}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                disabled={submittingAnswer}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAnswer}
                disabled={submittingAnswer || !answerText.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {submittingAnswer && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {submittingAnswer ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassPage;