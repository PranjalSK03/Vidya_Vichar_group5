import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthPage.css';


const StudentRegister= () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    universityId: '',
    batch: '',
    branch: ''
  });
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors= [];
    if (!formData.name.trim()) newErrors.push('Name is required');
    if (!formData.email.trim()) newErrors.push('Email is required');
    if (!formData.password) newErrors.push('Password is required');
    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }
    if (!formData.universityId.trim()) newErrors.push('University ID is required');
    if (!formData.batch) newErrors.push('Batch is required');
    if (!formData.branch) newErrors.push('Branch is required');
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/student/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.email,
          password: formData.password,
          roll_no: formData.universityId,
          batch: formData.batch,
          branch: formData.branch
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and redirect
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userRole', 'student');
        // Redirect to student dashboard
        console.log('Registration successful:', data.message);
      } else {
        setErrors([data.message]);
      }
    } catch (error) {
      setErrors(['Network error. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Student Registration</h1>
          <p>Join Vidya Vichar as a Student</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <p key={index} className="error-message">{error}</p>
              ))}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="universityId">University ID</label>
            <input
              type="text"
              id="universityId"
              name="universityId"
              value={formData.universityId}
              onChange={handleInputChange}
              placeholder="Enter your university ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="batch">Batch</label>
            <select
              id="batch"
              name="batch"
              value={formData.batch}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Batch</option>
              <option value="M.Tech">M.Tech</option>
              <option value="B.Tech">B.Tech</option>
              <option value="PHD">PHD</option>
              <option value="MS">MS</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="branch">Branch</label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Branch</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="universityId">University ID</label>
            <input
              type="text"
              id="universityId"
              name="universityId"
              value={formData.universityId}
              onChange={handleInputChange}
              placeholder="Enter your university ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/student/login" className="auth-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;