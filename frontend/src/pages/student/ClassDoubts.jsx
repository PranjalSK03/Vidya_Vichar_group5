import React, { useState, useEffect } from 'react';
import { api } from '../../config/api';

// Question Form Component - moved outside to prevent recreation on each render
const QuestionForm = ({ 
  questionText, 
  setQuestionText, 
  handleSubmitQuestion, 
  submittingQuestion, 
  setShowQuestionForm 
}) => (
  <div className="bg-gradient-to-r from-slate-50 to-indigo-50 border border-slate-200 rounded-xl p-6 mb-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-800">Ask a Question</h3>
    </div>
    <form onSubmit={handleSubmitQuestion}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your Question *
        </label>
        <textarea
          required
          rows="4"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-colors resize-none"
          placeholder="What would you like to ask about this lecture? Be specific and clear..."
        />
        <p className="text-xs text-slate-500 mt-1">
          {questionText.length}/500 characters
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={submittingQuestion || !questionText.trim() || questionText.length > 500}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submittingQuestion ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Submit Question
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setQuestionText('');
            setShowQuestionForm(false);
          }}
          className="px-6 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
);

const ClassDoubts = ({ lectureId, lectureObj, token, onBack }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  
  // Ask question form state
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  useEffect(() => {
    if (lectureId) {
      fetchLectureInfo();
      fetchQuestions();
    }
  }, [lectureId]);

  const fetchLectureInfo = async () => {
    try {
      // Get course information from the lectureObj
      if (lectureObj && lectureObj.course_id) {
        const courseResponse = await api.student.getCourseInfo(lectureObj.course_id);
        if (courseResponse.success) {
          setCourseInfo(courseResponse.data);
        }
      }
    } catch (error) {
      console.error('Error fetching course info:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.student.getLectureQuestions(lectureId);

      
      if (response.success && response.data?.questions) {
        setAllQuestions(response.data.questions);
      } else {
        setError(response.message || 'Failed to fetch questions');
        setAllQuestions([]);
      }
      
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions. Please try again.');
      setAllQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    if (!questionText.trim()) return;
    
    try {
      setSubmittingQuestion(true);
      
  const response = await api.student.askQuestion(questionText, lectureId);
      
      if (response.success) {
        // Reset form
        setQuestionText('');
        setShowQuestionForm(false);
        
        // Refresh questions list
        fetchQuestions();
      } else {
        setError(response.message || 'Failed to submit question');
      }
      
    } catch (error) {
      console.error('Error submitting question:', error);
      setError('Failed to submit question. Please try again.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const getFilteredQuestions = () => {
    switch (activeTab) {
      case 'answered':
        return allQuestions.filter(q => q.is_answered);
      case 'pending':
        return allQuestions.filter(q => !q.is_answered);
      default:
        return allQuestions;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTabCounts = () => {
    return {
      all: allQuestions.length,
      answered: allQuestions.filter(q => q.is_answered).length,
      pending: allQuestions.filter(q => !q.is_answered).length
    };
  };

  const TabButton = ({ tabKey, label, count, isActive, onClick }) => (
    <button
      onClick={() => onClick(tabKey)}
      className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
      }`}
    >
      <span>{label}</span>
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        isActive 
          ? 'bg-white/20 text-white' 
          : 'bg-slate-200 text-slate-600'
      }`}>
        {count}
      </span>
    </button>
  );

  const QuestionCard = ({ question }) => (
    <div className={`border rounded-xl p-6 transition-all duration-200 ${
      question.status === 'answered' 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-medium">
            {question.studentName ? question.studentName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <p className="font-medium text-slate-800">{question.studentName || 'Student'}</p>
            <p className="text-sm text-slate-500">{new Date(question.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
          question.status === 'answered'
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-orange-100 text-orange-700 border border-orange-200'
        }`}>
          {question.status === 'answered' ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              Answered
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
              Pending
            </>
          )}
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-slate-700 leading-relaxed">{question.content}</p>
      </div>
      
      {question.answer && (
        <div className="border-t border-green-200 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-indigo-700">Teacher's Answer</span>
            <span className="text-xs text-slate-500">
              • {new Date(question.answeredAt).toLocaleString()}
            </span>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-green-200">
            <p className="text-slate-700">{question.answer}</p>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Classes
          </button>
          <div className="h-6 w-px bg-slate-300"></div>
          <h2 className="text-2xl font-bold text-slate-800">Class Doubts</h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-600">Loading class doubts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Classes
          </button>
          <div className="h-6 w-px bg-slate-300"></div>
          <h2 className="text-2xl font-bold text-slate-800">Class Doubts</h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={fetchQuestions}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const counts = getTabCounts();
  const filteredQuestions = getFilteredQuestions();

  return (
    <div className="space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Classes
        </button>
        <div className="h-6 w-px bg-slate-300"></div>
        <h2 className="text-2xl font-bold text-slate-800">Class Doubts</h2>
      </div>

      {/* Class Information */}
      <div className="bg-gradient-to-r from-white to-indigo-50 border border-indigo-100 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Class Information
          </h3>
          <button
            onClick={() => setShowQuestionForm(!showQuestionForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ask Question
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium text-slate-700">Course</span>
            </div>
            <p className="text-lg font-semibold text-slate-800">{lectureObj?.course_id || 'Course'}</p>
            <p className="text-slate-600 text-sm">{courseInfo?.course_name || 'Course Name'}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium text-slate-700">Lecture</span>
            </div>
            <p className="text-lg font-semibold text-slate-800">Lecture {lectureObj?.lec_num || ''}</p>
            {lectureObj?.topic && <p className="text-slate-600 text-sm">{lectureObj.topic}</p>}
          </div>
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium text-slate-700">Schedule</span>
            </div>
            <p className="text-lg font-semibold text-slate-800">{lectureObj?.class_start ? new Date(lectureObj.class_start).toLocaleDateString() : 'Invalid Date'}</p>
            <p className="text-slate-600 text-sm">
              {lectureObj?.class_start ? new Date(lectureObj.class_start).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : 'Invalid Date'} - {lectureObj?.class_end ? new Date(lectureObj.class_end).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : 'Invalid Date'}
            </p>
          </div>
        </div>
      </div>

      {/* Question Form */}
      {showQuestionForm && (
        <QuestionForm 
          questionText={questionText}
          setQuestionText={setQuestionText}
          handleSubmitQuestion={handleSubmitQuestion}
          submittingQuestion={submittingQuestion}
          setShowQuestionForm={setShowQuestionForm}
        />
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
        <TabButton
          tabKey="all"
          label="All Questions"
          count={counts.all}
          isActive={activeTab === 'all'}
          onClick={setActiveTab}
        />
        <TabButton
          tabKey="answered"
          label="Answered"
          count={counts.answered}
          isActive={activeTab === 'answered'}
          onClick={setActiveTab}
        />
        <TabButton
          tabKey="pending"
          label="Pending"
          count={counts.pending}
          isActive={activeTab === 'pending'}
          onClick={setActiveTab}
        />
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 text-slate-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Questions Found</h3>
          <p className="text-slate-600 mb-4">
            {activeTab === 'all' && 'No questions have been asked for this class yet.'}
            {activeTab === 'answered' && 'No questions have been answered for this class yet.'}
            {activeTab === 'pending' && 'No pending questions for this class.'}
          </p>
          <button
            onClick={() => setShowQuestionForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ask First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question._id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassDoubts;
