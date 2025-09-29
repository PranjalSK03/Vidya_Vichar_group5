import React, { useState, useEffect } from 'react';
import { api } from '../../config/api';
import ResourceSelector from './ResourceSelector.jsx';

const LectureDoubts = ({ userData, selectedLecture, selectedCourse, onBack }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [allDoubts, setAllDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Ask question form state
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [showResourceSelector, setShowResourceSelector] = useState(false);
  const [selectedResources, setSelectedResources] = useState([]);
  const [resourceContext, setResourceContext] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  useEffect(() => {
    if (selectedLecture && userData?.id) {
      fetchLectureDoubts();
    }
  }, [selectedLecture, userData]);

  const fetchLectureDoubts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Debug: Log the lectureId being sent
  console.log('LectureDoubts: Fetching doubts for lectureId:', selectedLecture);
  // Use the correct endpoint for lecture doubts/questions
  const response = await api.student.getLectureQuestions(selectedLecture);
      console.log('LectureDoubts: API response:', response);
      let doubts = [];
      if (response.success) {
        if (Array.isArray(response.data)) {
          doubts = response.data;
        } else if (response.data?.questions && Array.isArray(response.data.questions)) {
          doubts = response.data.questions;
        } else if (Array.isArray(response.data.doubts)) {
          doubts = response.data.doubts;
        }
        setAllDoubts(doubts);
      } else {
        setError(response.message || 'Failed to fetch lecture doubts');
        setAllDoubts([]);
      }
    } catch (error) {
      console.error('Error fetching lecture doubts:', error);
      setError('Failed to load lecture doubts. Please try again.');
      setAllDoubts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceToggle = (resourceId) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    if (!questionText.trim()) return;
    
    try {
      setSubmittingQuestion(true);
      
      const questionData = {
        question_text: questionText,
        lecture_id: selectedLecture.lecture_id,
        referenced_resources: selectedResources,
        resource_context: resourceContext || null
      };
      
      // Here you would make the API call to submit the question
      console.log('Submitting question:', questionData);
      
      // Mock successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setQuestionText('');
      setSelectedResources([]);
      setResourceContext('');
      setShowQuestionForm(false);
      
      // Refresh doubts list
      fetchLectureDoubts();
      
    } catch (error) {
      console.error('Error submitting question:', error);
      setError('Failed to submit question. Please try again.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const getFilteredDoubts = () => {
    switch (activeTab) {
      case 'answered':
        return allDoubts.filter(doubt => doubt.is_answered);
      case 'pending':
        return allDoubts.filter(doubt => !doubt.is_answered);
      default:
        return allDoubts;
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
      all: allDoubts.length,
      answered: allDoubts.filter(d => d.is_answered).length,
      pending: allDoubts.filter(d => !d.is_answered).length
    };
  };

  const getResourceTypeIcon = (type) => {
    const icons = {
      text: '📄',
      pdf: '📕',
      video: '🎥',
      link: '🔗',
      image: '🖼️',
      document: '📋'
    };
    return icons[type] || '📄';
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

  const DoubtCard = ({ doubt }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-slate-800">{doubt.student_name}</h3>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              doubt.is_answered 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {doubt.is_answered ? '✓ Answered' : '⏳ Pending'}
            </div>
          </div>
          {/* Always show the question (support both 'question' and 'question_text' fields) */}
          <div className="mb-3">
            <span className="font-medium text-slate-700">Question:</span>
            <p className="text-slate-700">{doubt.question || doubt.question_text}</p>
          </div>
          {/* Resource References - only show if resources exist */}
          {doubt.referenced_resources && doubt.referenced_resources.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600 text-sm font-medium">📎 Resources:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {doubt.referenced_resources.map((resource, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    <span>{getResourceTypeIcon(resource.resource_type)}</span>
                    <span>{resource.title}</span>
                  </span>
                ))}
              </div>
              {doubt.resource_context && (
                <p className="text-blue-700 text-sm mt-2 italic">
                  {doubt.resource_context}
                </p>
              )}
            </div>
          )}
          {/* Show answer only if present */}
          {doubt.is_answered && doubt.answer && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800 text-sm">Answer</span>
              </div>
              <p className="text-green-900">{doubt.answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Question Form Component
  const QuestionForm = () => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Ask a Question</h3>
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="What would you like to ask about this lecture?"
          />
        </div>

        {/* Resource Reference Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Reference Resources (Optional)
            </label>
            <button
              type="button"
              onClick={() => setShowResourceSelector(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add Resources
            </button>
          </div>
          
          {selectedResources.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3">
              <p className="text-indigo-800 font-medium text-sm mb-2">
                Selected Resources ({selectedResources.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedResources.map(resourceId => (
                  <span key={resourceId} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                    📄 Resource {resourceId.slice(-3)}
                    <button
                      type="button"
                      onClick={() => handleResourceToggle(resourceId)}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resource Context (Optional)
            </label>
            <input
              type="text"
              value={resourceContext}
              onChange={(e) => setResourceContext(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="How do the referenced resources relate to your question?"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submittingQuestion || !questionText.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingQuestion ? 'Submitting...' : 'Ask Question'}
          </button>
          <button
            type="button"
            onClick={() => {
              setQuestionText('');
              setSelectedResources([]);
              setResourceContext('');
              setShowQuestionForm(false);
            }}
            className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
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
            Back to Lectures
          </button>
          <div className="h-6 w-px bg-slate-300"></div>
          <h2 className="text-2xl font-bold text-slate-800">Lecture {selectedLecture?.lec_num} - Doubts</h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-600">Loading lecture doubts...</p>
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
            Back to Lectures
          </button>
          <div className="h-6 w-px bg-slate-300"></div>
          <h2 className="text-2xl font-bold text-slate-800">Lecture {selectedLecture?.lec_num} - Doubts</h2>
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
              onClick={fetchLectureDoubts}
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
  const filteredDoubts = getFilteredDoubts();

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
          Back to Lectures
        </button>
        <div className="h-6 w-px bg-slate-300"></div>
        <h2 className="text-2xl font-bold text-slate-800">Lecture {selectedLecture?.lec_num} - Doubts</h2>
      </div>

      {/* Lecture Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Lecture Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-slate-600">Course:</span>
            <p className="text-slate-800">{selectedCourse?.course_name}</p>
          </div>
          <div>
            <span className="font-medium text-slate-600">Lecture:</span>
            <p className="text-slate-800">Lecture {selectedLecture?.lec_num}</p>
          </div>
          <div>
            <span className="font-medium text-slate-600">Date:</span>
            <p className="text-slate-800">{new Date(selectedLecture?.class_start).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
        <TabButton
          tabKey="all"
          label="All Doubts"
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

      {/* Doubts List */}
      {filteredDoubts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 text-slate-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Doubts Found</h3>
          <p className="text-slate-600 mb-4">
            {activeTab === 'all' && 'No doubts were raised for this lecture.'}
            {activeTab === 'answered' && 'No doubts were answered for this lecture.'}
            {activeTab === 'pending' && 'No pending doubts for this lecture.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDoubts.map((doubt) => (
            <DoubtCard key={doubt._id} doubt={doubt} />
          ))}
        </div>
      )}

      {/* Resource Selector Modal */}
      {showResourceSelector && (
        <ResourceSelector
          courseId={selectedCourse?.course_id}
          selectedResources={selectedResources}
          onResourceToggle={handleResourceToggle}
          onClose={() => setShowResourceSelector(false)}
        />
      )}
    </div>
  );
};

export default LectureDoubts;
