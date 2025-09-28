import React, { useEffect, useState } from 'react';

const PrevLecturesTeacher = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all courses for dropdown
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/teacher/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
        } else {
          setError(data.message || 'Failed to fetch courses');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    // Fetch previous lectures for selected course
    const fetchLectures = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/teacher/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setLectures(data.data.filter(l => l.course_id === selectedCourse));
        } else {
          setError(data.message || 'Failed to fetch lectures');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, [selectedCourse]);

  return (
    <div>
      <h1>Previous Lectures</h1>
      {error && <p style={{color:'red'}}>{error}</p>}
      <label>Select Course: </label>
      <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
        <option value="">--Select--</option>
        {courses.map(c => (
          <option key={c._id} value={c.course_id}>{c.course_name} ({c.course_id})</option>
        ))}
      </select>
      {loading && <p>Loading...</p>}
      {selectedCourse && lectures.length === 0 && !loading && <p>No previous lectures for this course.</p>}
      <ul>
        {lectures.map(lec => (
          <li key={lec._id}>
            <strong>{lec.lecture_title}</strong> ({lec.lecture_id})<br/>
            Date: {new Date(lec.class_start).toLocaleString()}<br/>
            <PrevLectureQuestionsTeacher lectureId={lec.lecture_id} />
          </li>
        ))}
      </ul>
    </div>
  );
};

// Subcomponent to show questions and answers for a lecture
const PrevLectureQuestionsTeacher = ({ lectureId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/teacher/lecture/${lectureId}/questions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setQuestions(data.data);
        } else {
          setError(data.message || 'Failed to fetch questions');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [lectureId]);

  if (loading) return <div>Loading questions...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div style={{marginLeft:'1rem'}}>
      <h4>Questions:</h4>
      {questions.length === 0 ? <p>No questions for this lecture.</p> : (
        <ul>
          {questions.map(q => (
            <li key={q._id}>
              <strong>{q.question_text}</strong> {q.is_important && <span style={{color:'orange'}}>[Important]</span>} {q.is_answered && <span style={{color:'green'}}>[Answered]</span>}<br/>
              <PrevLectureAnswersTeacher questionId={q._id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const PrevLectureAnswersTeacher = ({ questionId }) => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnswers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/teacher/question/${questionId}/answers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setAnswers(data.data);
        } else {
          setError(data.message || 'Failed to fetch answers');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnswers();
  }, [questionId]);

  if (loading) return <div>Loading answers...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div style={{marginLeft:'1rem'}}>
      <h5>Answers:</h5>
      {answers.length === 0 ? <p>No answers yet.</p> : (
        <ul>
          {answers.map(a => (
            <li key={a._id}><strong>{a.answerer_name}:</strong> {a.answer}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PrevLecturesTeacher;
