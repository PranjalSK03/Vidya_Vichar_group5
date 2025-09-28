import React, { useEffect, useState } from 'react';

const Lectures = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [answeringQ, setAnsweringQ] = useState(null);

  useEffect(() => {
    // Fetch all courses for dropdown
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/teacher/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch {}
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    // Fetch lectures for selected course
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
          setLectures(data.data.filter(l => l.course_id === selectedCourse && new Date(l.class_start) <= new Date() && new Date(l.class_end) >= new Date()));
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

  useEffect(() => {
    if (!selectedLecture) return;
    // Fetch questions for selected lecture
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/teacher/lecture/${selectedLecture}/questions`, {
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
  }, [selectedLecture]);

  const handleMarkImportant = async (question_id) => {
    // Implement mark as important (PUT endpoint if available)
    // ...
  };

  const handleMarkAnswered = async (question_id) => {
    // Implement mark as answered (PUT endpoint if available)
    // ...
  };

  const handleAnswer = async (question_id) => {
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/teacher/question/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question_id, answer: answerText })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Answer submitted!');
        setAnswerText('');
        setAnsweringQ(null);
      } else {
        setError(data.message || 'Failed to submit answer');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Current Lectures</h1>
      {error && <p style={{color:'red'}}>{error}</p>}
      {message && <p style={{color:'green'}}>{message}</p>}
      <label>Select Course: </label>
      <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
        <option value="">--Select--</option>
        {courses.map(c => (
          <option key={c._id} value={c.course_id}>{c.course_name} ({c.course_id})</option>
        ))}
      </select>
      <br/>
      <label>Select Lecture: </label>
      <select value={selectedLecture} onChange={e => setSelectedLecture(e.target.value)}>
        <option value="">--Select--</option>
        {lectures.map(l => (
          <option key={l._id} value={l.lecture_id}>{l.lecture_title} ({l.lecture_id})</option>
        ))}
      </select>
      <br/>
      {loading && <p>Loading...</p>}
      {selectedLecture && questions.length > 0 && (
        <ul>
          {questions.map(q => (
            <li key={q._id}>
              <strong>{q.question_text}</strong> {q.is_important && <span style={{color:'orange'}}>[Important]</span>} {q.is_answered && <span style={{color:'green'}}>[Answered]</span>}<br/>
              <button onClick={() => handleMarkImportant(q._id)}>Mark Important</button>
              <button onClick={() => handleMarkAnswered(q._id)}>Mark Answered</button>
              <br/>
              {answeringQ === q._id ? (
                <form onSubmit={e => { e.preventDefault(); handleAnswer(q._id); }}>
                  <input value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder="Type answer..." required />
                  <button type="submit" disabled={loading}>Submit</button>
                  <button type="button" onClick={() => setAnsweringQ(null)}>Cancel</button>
                </form>
              ) : (
                <button onClick={() => setAnsweringQ(q._id)}>Answer</button>
              )}
            </li>
          ))}
        </ul>
      )}
      {selectedLecture && questions.length === 0 && !loading && <p>No questions for this lecture.</p>}
    </div>
  );
};

export default Lectures;
