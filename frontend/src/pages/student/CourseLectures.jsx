import React, { useState, useEffect } from 'react';
import { api } from '../../config/api';

const CourseLectures = ({ userData, selectedCourse, onLectureSelect, onBack }) => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedCourse && userData?.id) {
      fetchCourseLectures();
    }
  }, [selectedCourse, userData]);

  const fetchCourseLectures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use real API endpoint - selectedCourse.id is the MongoDB _id
      const response = await api.student.getCourseLectures(selectedCourse.id);
      
      if (response.success && response.data?.lectures) {
        setLectures(response.data.lectures);
      } else {
        setError(response.message || 'Failed to fetch course lectures');
        setLectures([]);
      }
      
    } catch (error) {
      console.error('Error fetching course lectures:', error);
      setError('Failed to load course lectures. Please try again.');
      setLectures([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (start, end) => {
    const startTime = new Date(start).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTime = new Date(end).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${startTime} - ${endTime}`;
  };

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
            Back to Courses
          </button>
          <div className="h-6 w-px bg-slate-300"></div>
          <h2 className="text-2xl font-bold text-slate-800">{selectedCourse?.course_name} - Lectures</h2>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-600">Loading course lectures...</p>
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
            Back to Courses
          </button>
          <div className="h-6 w-px bg-slate-300"></div>
          <h2 className="text-2xl font-bold text-slate-800">{selectedCourse?.course_name} - Lectures</h2>
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
              onClick={fetchCourseLectures}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          Back to Courses
        </button>
        <div className="h-6 w-px bg-slate-300"></div>
        <h2 className="text-2xl font-bold text-slate-800">{selectedCourse?.course_name} - Lectures</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Course Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-slate-600">Course ID:</span>
            <p className="text-slate-800">{selectedCourse?.course_id}</p>
          </div>
          <div>
            <span className="font-medium text-slate-600">Instructor:</span>
            <p className="text-slate-800">{selectedCourse?.instructor || 'Not assigned'}</p>
          </div>
          <div>
            <span className="font-medium text-slate-600">Total Lectures:</span>
            <p className="text-slate-800">{lectures.length}</p>
          </div>
        </div>
      </div>

      {lectures.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 text-slate-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Lectures Found</h3>
          <p className="text-slate-600 mb-6">This course doesn't have any recorded lectures yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {lectures.map((lecture) => (
            <div
              key={lecture._id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">
                    Lecture {lecture.lec_num}
                  </h3>
                  {lecture.topic && (
                    <p className="text-slate-600 text-sm mb-2 font-medium">
                      Topic: {lecture.topic}
                    </p>
                  )}
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>
                      <span className="font-medium">Date:</span> {formatDate(lecture.class_start)}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span> {formatTime(lecture.class_start, lecture.class_end)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLectureSelect && onLectureSelect(lecture); // Pass full lecture object
                  }}
                  className="flex items-center gap-2 text-indigo-600 group-hover:text-indigo-700 font-medium"
                >
                  <span className="text-sm">View Doubts</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseLectures;
