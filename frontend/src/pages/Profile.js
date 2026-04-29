import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    village: user?.village || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update profile API call here
      updateProfile({ ...user, ...formData });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Update your account information</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mobile Number (Read-Only)</label>
            <input
              type="text"
              value={formData.mobile}
              readOnly
            />
            <p className="help-text">Your mobile number cannot be changed.</p>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="text"
              value={formData.email}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Village / Area</label>
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>

        <div className="profile-footer">
          <a href="/dashboard">Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
