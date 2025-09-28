import React, { useEffect, useState } from 'react';

const LectureQuestions = ({ lectureId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [askMsg, setAskMsg] = useState('');
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!lectureId) return;
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/student/dashboard/all-questions/${lectureId}`, {
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

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return setAskMsg('Enter your question');
    setAsking(true);
    setAskMsg('');
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/student/dashboard/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lecture_id: lectureId, question_text: questionText })
      });
      const data = await res.json();
      if (data.success) {
        setAskMsg('Question asked!');
        setQuestionText('');
        // Optionally refresh questions
      } else {
        setError(data.message || 'Failed to ask question');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setAsking(false);
    }
  };

  if (!lectureId) return <div>Select a lecture to view questions.</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;

  return (
    <div>
      <h2>Questions for Lecture {lectureId}</h2>
      {askMsg && <p style={{color:'green'}}>{askMsg}</p>}
      <form onSubmit={handleAskQuestion}>
        <input value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Ask a question..." />
        <button type="submit" disabled={asking}>Ask</button>
      </form>
      <div style={{display:'flex',flexWrap:'wrap',gap:'1rem',marginTop:'1rem'}}>
        {questions.map(q => (
          <div key={q._id} style={{border:'1px solid #ccc',padding:'1rem',background:'#fffbe6',minWidth:'200px'}}>
            <strong>{q.question_text}</strong><br/>
            <span>By: {q.student_id}</span><br/>
            <span>{q.is_answered ? 'Answered' : 'Unanswered'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LectureQuestions;
