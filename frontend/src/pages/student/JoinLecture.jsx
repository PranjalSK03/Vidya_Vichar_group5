import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const stickyColors = ['#fff9c4', '#b3e5fc', '#ffe0b2', '#c8e6c9', '#f8bbd0'];

const JoinLecture = () => {
  const { lectureId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/users/student/dashboard/all-questions/${lectureId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setQuestions(data.data.questions || []);
        } else {
          setError(data.message || 'Failed to fetch questions');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    if (lectureId) fetchQuestions();
  }, [lectureId]);

  const handleAskQuestion = () => {
    navigate(`/student/ask-question/${lectureId}`);
  };

  return (
    <div>
      <h2>Lecture Questions</h2>
      <button onClick={handleAskQuestion} style={{marginBottom: '1rem'}}>Ask a Question</button>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{color:'red'}}>{error}</p>
      ) : questions.length === 0 ? (
        <p>No questions yet for this lecture.</p>
      ) : (
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
          {questions.map((q, idx) => (
            <div key={q.question_id} style={{
              background: stickyColors[idx % stickyColors.length],
              padding: '1rem',
              borderRadius: '8px',
              minWidth: '200px',
              boxShadow: '2px 2px 8px #ccc',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              <div style={{fontWeight: 'bold'}}>{q.question_text}</div>
              <div style={{fontSize: '0.9em', color: '#555'}}>Asked by: {q.student_id}</div>
              <div style={{marginTop: '0.5em'}}>
                {q.is_important && <span style={{color: 'orange', fontWeight: 'bold'}}>Important </span>}
                {q.is_answered && <span style={{color: 'green', fontWeight: 'bold'}}>Answered</span>}
              </div>
              {q.answer && q.answer.length > 0 && (
                <div style={{marginTop: '0.5em'}}>
                  <strong>Answers:</strong>
                  <ul style={{paddingLeft: '1em'}}>
                    {q.answer.map(a => (
                      <li key={a.answer_id}><b>{a.answerer_name}:</b> {a.answer}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default JoinLecture;
