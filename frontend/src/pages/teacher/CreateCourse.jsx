
import React, { useEffect, useState } from 'react';

const CreateCourse = () => {
  const [form, setForm] = useState({
    course_name: '',
    batch: '',
    branch: '',
    teacher_ids: []
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch all teachers for dropdown
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/teacher/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setTeachers(data.data);
        }
      } catch {}
    };
    fetchTeachers();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleTeacherSelect = e => {
    const options = Array.from(e.target.selectedOptions);
    setForm(f => ({ ...f, teacher_ids: options.map(o => o.value) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/teacher/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course_name: form.course_name,
          batch: form.batch,
          branch: form.branch,
          teacher_id: form.teacher_ids
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Course created!');
        setForm({ course_name: '', batch: '', branch: '', teacher_ids: [] });
      } else {
        setError(data.message || 'Failed to create course');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Course</h1>
      {error && <p style={{color:'red'}}>{error}</p>}
      {message && <p style={{color:'green'}}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="course_name" value={form.course_name} onChange={handleChange} placeholder="Course Name" required />
        <input name="batch" value={form.batch} onChange={handleChange} placeholder="Batch (e.g. MT/BT/PH/MS)" required />
        <input name="branch" value={form.branch} onChange={handleChange} placeholder="Branch (e.g. CSE/ECE)" required />
        <label>Select Teachers (hold Ctrl to select multiple):</label>
        <select multiple value={form.teacher_ids} onChange={handleTeacherSelect}>
          {teachers.map(t => (
            <option key={t.teacher_id} value={t.teacher_id}>{t.name} ({t.teacher_id})</option>
          ))}
        </select>
        <button type="submit" disabled={loading}>Create</button>
      </form>
    </div>
  );
};

export default CreateCourse;