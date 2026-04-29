import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(token, formData.password);
      setMessage({ type: 'success', text: 'Password reset successfully!' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Create a new password for your account</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>New Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              required
              minLength="6"
            />
            <p className="help-text">Minimum 6 characters.</p>
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              required
              minLength="6"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p><a href="/login">Back to Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
