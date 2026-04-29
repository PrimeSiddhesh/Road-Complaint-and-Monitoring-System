import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { adminService } from '../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminService.login(formData);
      login(response.admin, response.token);
      // replace history so previous (public) pages are not reachable via back
      navigate('/admin/profile', { replace: true });
    } catch (error) {
      setError(error.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Admin Login</h1>
          <p>Access the administrative control panel</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter admin username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have a Taluka Admin account? <a href="/admin/register">Register Here</a></p>
          <p><a href="/">Back to Home</a></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
