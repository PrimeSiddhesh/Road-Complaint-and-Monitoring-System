import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { getStates, getDistricts, getTalukas } from '../utils/locations';

const AdminRegister = () => {
  const [states] = useState(getStates());
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    state: '',
    district: '',
    taluka: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Update districts when state changes
  useEffect(() => {
    if (formData.state) {
      const availableDistricts = getDistricts(formData.state);
      setDistricts(availableDistricts);
      
      if (!availableDistricts.includes(formData.district)) {
        setFormData(prev => ({ ...prev, district: '' }));
      }
    } else {
      setDistricts([]);
      setFormData(prev => ({ ...prev, district: '' }));
    }
  }, [formData.state]);

  // Update talukas when district changes
  useEffect(() => {
    if (formData.state && formData.district) {
      const availableTalukas = getTalukas(formData.state, formData.district);
      setTalukas(availableTalukas);
      
      if (!availableTalukas.includes(formData.taluka)) {
        setFormData(prev => ({ ...prev, taluka: '' }));
      }
    } else {
      setTalukas([]);
      setFormData(prev => ({ ...prev, taluka: '' }));
    }
  }, [formData.district, formData.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.taluka) {
      setError('Please select a Taluka.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(data.message);
      setFormData({ username: '', password: '', state: 'Maharashtra', district: 'Pune', taluka: '' });
      setTimeout(() => navigate('/admin/login'), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Taluka Admin Registration</h1>
          <p>Register to manage road infrastructure in your assigned Taluka</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>State</label>
            <select name="state" value={formData.state} onChange={handleChange} required>
              <option value="">Select State</option>
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>District</label>
            <select name="district" value={formData.district} onChange={handleChange} required disabled={!formData.state}>
              <option value="">Select District</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Taluka</label>
            <select name="taluka" value={formData.taluka} onChange={handleChange} required disabled={!formData.district}>
              <option value="">Select Taluka</option>
              {talukas.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Admin Username</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder="e.g. haveli_admin"
              required 
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="e.g. admin@taluka.gov.in"
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Create a strong password"
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary">Submit Application</button>
        </form>

        <div className="auth-footer">
          <p>Already approved? <a href="/admin/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
