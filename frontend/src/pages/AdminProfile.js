import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { adminService } from '../services/api';
import './adminDashboard.css';

const AdminProfile = () => {
  const { user: admin, updateProfile } = useContext(AuthContext);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [adminForm, setAdminForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [admins, setAdmins] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { logout: doLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    doLogout();
    // on logout go to public home page
    navigate('/', { replace: true });
  };

  // prevent browser back-navigation from leaving admin pages while logged-in
  useEffect(() => {
    if (!(admin && admin.role)) return;
    // push current state so back will stay
    try { window.history.pushState(null, '', location.pathname); } catch (e) {}
    const onPop = () => {
      try { window.history.pushState(null, '', location.pathname); } catch (e) {}
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [admin, location.pathname]);

  const fetchAdmins = async () => {
    try {
      const data = await adminService.getAdmins();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error('fetch admins', err);
      setError('Failed to fetch admin users');
    }
  };

  const openPasswordModal = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setMessage('');
    setError('');
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setMessage('');
    setError('');
  };

  const openAdminModal = () => {
    setAdminForm({ username: '', password: '', confirmPassword: '' });
    setMessage('');
    setError('');
    fetchAdmins();
    setShowAdminModal(true);
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
    setAdminForm({ username: '', password: '', confirmPassword: '' });
    setMessage('');
    setError('');
  };

  const handlePasswordChange = e => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handleAdminFormChange = e => {
    const { name, value } = e.target;
    setAdminForm({ ...adminForm, [name]: value });
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      await adminService.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setMessage('Password changed successfully!');
      setTimeout(() => {
        closePasswordModal();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
  };

  const submitCreateAdmin = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!adminForm.username || !adminForm.password || !adminForm.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (adminForm.password !== adminForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (adminForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await adminService.createAdmin({ username: adminForm.username, password: adminForm.password });
      setMessage('Admin user created successfully!');
      setAdminForm({ username: '', password: '', confirmPassword: '' });
      fetchAdmins();
    } catch (err) {
      setError(err.message || 'Failed to create admin');
    }
  };

  const deleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin user?')) return;
    
    try {
      await adminService.deleteAdmin(adminId);
      setMessage('Admin user deleted successfully!');
      fetchAdmins();
    } catch (err) {
      setError(err.message || 'Failed to delete admin');
    }
  };

  React.useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getProfile();
        if (data.admin) {
          updateProfile(data.admin);
        }
      } catch (err) {
        console.error('could not refresh admin profile', err);
      }
    };
    load();
  }, [updateProfile]);

  return (
    <div className="admin-dashboard">
      {/* Profile header */}
      <div className="admin-profile-card">
        <div className="profile-avatar">
          <i className="profile-icon">👤</i>
        </div>
        <div className="profile-info">
          <h2>Welcome, <span className="admin-name">{admin?.username || 'Admin'}</span></h2>
          <p className="profile-subtitle">Administrator Account</p>
          <p className="profile-role">Role: <span className="role-text">{admin?.role || 'admin'}</span></p>
        </div>
        <button className="btn btn-logout" onClick={logout}>Logout</button>
      </div>

      <div className="action-buttons">
        <button className="btn btn-secondary" onClick={openPasswordModal}>Change Admin Password</button>
        <button className="btn btn-secondary" onClick={openAdminModal}>Manage Admin Users</button>
      </div>

      {/* Password modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Admin Password</h2>
              <button className="modal-close" onClick={closePasswordModal}>×</button>
            </div>
            <form onSubmit={submitPasswordChange} className="modal-form">
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Change Password</button>
                <button type="button" className="btn btn-secondary" onClick={closePasswordModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Admin Users Modal */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={closeAdminModal}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Admin Users</h2>
              <button className="modal-close" onClick={closeAdminModal}>×</button>
            </div>
            <div className="modal-content">
              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}
              
              <div className="create-admin-section">
                <h3>Create New Admin User</h3>
                <form onSubmit={submitCreateAdmin} className="create-admin-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        name="username"
                        value={adminForm.username}
                        onChange={handleAdminFormChange}
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={adminForm.password}
                        onChange={handleAdminFormChange}
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={adminForm.confirmPassword}
                        onChange={handleAdminFormChange}
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-create">Create Admin</button>
                  </div>
                </form>
              </div>

              <div className="admins-list-section">
                <h3>Current Admin Users</h3>
                {admins.length === 0 ? (
                  <p className="no-data">No admin users found</p>
                ) : (
                  <table className="admins-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map(admin => (
                        <tr key={admin._id}>
                          <td>{admin.username}</td>
                          <td><span className="role-badge">{admin.role}</span></td>
                          <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                          <td>
                            {admins.length > 1 && (
                              <button
                                onClick={() => deleteAdmin(admin._id)}
                                className="btn btn-small btn-danger"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeAdminModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="view-complaints-button">
        <Link to="/admin" className="btn btn-primary">Go to Complaint Dashboard</Link>
      </div>
    </div>
  );
};

export default AdminProfile;
