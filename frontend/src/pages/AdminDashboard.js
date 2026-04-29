import React, { useState } from 'react';
import { adminService, API_BASE_URL } from '../services/api';
import ComplaintLocationMap from '../components/ComplaintLocationMap';
import './adminDashboard.css';


const AdminDashboard = () => {
  const [filters, setFilters] = useState({ location: '', status: '' });
  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedComplaintPath, setSelectedComplaintPath] = useState([]);
  const [selectedComplaintRoutePath, setSelectedComplaintRoutePath] = useState([]);
  
  const [adminProfile, setAdminProfile] = useState(null);
  const [pendingAdmins, setPendingAdmins] = useState([]);

  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ location: '', status: '' });
    fetchComplaints();
  };

  const fetchComplaints = async () => {
    try {
      const data = await adminService.getComplaints(filters);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('fetch complaints', err);
    }
  };

  const fetchProfileAndPendingAdmins = async () => {
    try {
      const profileData = await adminService.getProfile();
      setAdminProfile(profileData.admin);
      if (profileData.admin.role === 'superadmin') {
        const pendingData = await adminService.getPendingAdmins();
        setPendingAdmins(pendingData.admins || []);
      }
    } catch (err) {
      console.error('fetch profile/pending admins', err);
    }
  };

  const approveAdmin = async (id) => {
    try {
      await adminService.approveAdmin(id);
      fetchProfileAndPendingAdmins();
    } catch (err) {
      console.error('approve admin error', err);
      alert('Failed to approve admin');
    }
  };

  const declineAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to decline and remove this admin request?")) return;
    try {
      await adminService.declineAdmin(id);
      fetchProfileAndPendingAdmins();
    } catch (err) {
      console.error('decline admin error', err);
      alert('Failed to decline admin');
    }
  };

  const exportCSV = () => {
    if (complaints.length === 0) return;
    const header = ['ID', 'User', 'Mobile', 'Village', 'Location', 'Status', 'Flags'];
    const rows = complaints.map(c => [
      c._id,
      c.user?.name || '',
      c.user?.mobile || '',
      c.user?.village || '',
      c.location || '',
      c.status,
      c.flags || ''
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${v}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'complaints.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const changeStatus = async (id, status) => {
    try {
      await adminService.updateComplaintStatus(id, status);
      fetchComplaints();
    } catch (err) {
      console.error('status update', err);
    }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await adminService.deleteComplaint(id);
      fetchComplaints();
    } catch (err) {
      console.error('delete complaint', err);
    }
  };

  const viewImage = (filename) => {
    // open image in modal viewer
    if (filename) {
      const url = filename.startsWith('http') ? filename : `${serverBase}/uploads/${encodeURIComponent(filename)}`;
      setModalImage(url);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImage('');
  };

  const openMap = (complaint) => {
    const roadPath = Array.isArray(complaint.path)
      ? complaint.path
      : [];
    const actualRoadRoute = Array.isArray(complaint.routePath)
      ? complaint.routePath
      : [];
    const fallbackLat = complaint.lat ?? complaint.latitude;
    const fallbackLng = complaint.lng ?? complaint.longitude;

    if (roadPath.length === 0 && actualRoadRoute.length === 0 && (typeof fallbackLat !== 'number' || typeof fallbackLng !== 'number')) {
      return;
    }

    if (roadPath.length > 0 || actualRoadRoute.length > 0) {
      setSelectedComplaintPath(roadPath);
      setSelectedComplaintRoutePath(actualRoadRoute);
    } else {
      setSelectedComplaintPath([{ lat: fallbackLat, lng: fallbackLng }]);
      setSelectedComplaintRoutePath([]);
    }

    setShowLocationModal(true);
  };

  const closeLocationModal = () => {
    setShowLocationModal(false);
    setSelectedComplaintPath([]);
  };

  const renderStatus = status => {
    const map = {
      Pending: 'badge-pending',
      'In Progress': 'badge-progress',
      Resolved: 'badge-resolved'
    };
    return <span className={`status-badge ${map[status]}`}>{status}</span>;
  };

  // initial load
  React.useEffect(() => {
    fetchComplaints();
    fetchProfileAndPendingAdmins();
  }, []);

  const serverBase = API_BASE_URL.replace(/\/api$/, '');

  return (
    <div className="admin-dashboard">
      <div className="top-card">
        <div className="top-text">
          <h1>
            {adminProfile?.role === 'superadmin' 
              ? 'Main Admin Panel' 
              : `Taluka Admin - ${adminProfile?.taluka || ''}`}
          </h1>
          <p>Review and manage user complaints</p>
        </div>
      </div>

      {adminProfile?.role === 'superadmin' && pendingAdmins.length > 0 && (
        <div className="complaints-section" style={{marginBottom: '2rem'}}>
          <div className="table-card">
            <div style={{padding: '1rem', borderBottom: '1px solid var(--border-color)'}}>
              <h2 style={{color: 'var(--primary-green)'}}>Pending Taluka Admin Approvals</h2>
            </div>
            <table className="admins-table" style={{width: '100%', borderCollapse: 'collapse', background: 'var(--bg-section-alt)'}}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>State</th>
                  <th>District</th>
                  <th>Taluka</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAdmins.map(admin => (
                  <tr key={admin._id}>
                    <td>{admin.username}</td>
                    <td>{admin.state}</td>
                    <td>{admin.district}</td>
                    <td><strong>{admin.taluka}</strong></td>
                    <td>
                      <button onClick={() => approveAdmin(admin._id)} className="btn btn-small" style={{background: 'var(--secondary-green)', color: 'white'}}>Approve</button>
                      <button onClick={() => declineAdmin(admin._id)} className="btn btn-small btn-danger" style={{marginLeft: '0.5rem'}}>Decline</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="complaints-section">
        <div className="filter-card">
          <form className="filters" onSubmit={e => { e.preventDefault(); fetchComplaints(); }}>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleChange}
            />
            <select name="status" value={filters.status} onChange={handleChange}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>Clear</button>
            <button type="button" className="btn btn-primary" onClick={exportCSV}>Export CSV</button>
          </form>
        </div>

        <div className="table-card">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Photo</th>
                <th>User</th>
                <th>Mobile</th>
                <th>Village</th>
                <th>Taluka</th>
                <th>Location</th>
                <th>Status</th>
                <th>Flags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(item => (
                <tr key={item._id}>
                  <td>{item._id}</td>
                  <td>
                    {item.image ? (
                      <img
                        src={item.image.startsWith('http') ? item.image : `${serverBase}/uploads/${encodeURIComponent(item.image)}`}
                        alt="complaint"
                        className="thumb"
                        onClick={() => viewImage(item.image)}
                      />
                    ) : (
                      <span className="no-thumb">—</span>
                    )}
                  </td>
                  <td>{item.user?.name}</td>
                  <td>{item.user?.mobile}</td>
                  <td>{item.user?.village}</td>
                  <td>{item.taluka}</td>
                  <td>{item.location}</td>
                  <td>{renderStatus(item.status)}</td>
                  <td>{item.flags}</td>
                  <td className="actions-cell">
                    <button onClick={() => viewImage(item.image)} className="btn btn-small">View Image</button>
                    <button onClick={() => changeStatus(item._id, 'Resolved')} className="btn btn-small">Resolve</button>
                    <button onClick={() => deleteComplaint(item._id)} className="btn btn-small btn-danger">Delete</button>
                    <button
                      onClick={() => openMap(item)}
                      className="btn btn-small"
                    >
                      Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="img-modal-overlay" onClick={closeModal}>
          <div className="img-modal" onClick={(e) => e.stopPropagation()}>
            <button className="img-modal-close" onClick={closeModal}>×</button>
            <img src={modalImage} alt="uploaded" />
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="img-modal-overlay" onClick={closeLocationModal}>
          <div className="location-modal" onClick={(e) => e.stopPropagation()}>
            <button className="img-modal-close" onClick={closeLocationModal}>×</button>
            <h3>Complaint Location</h3>
            <ComplaintLocationMap
              path={selectedComplaintPath}
              routePath={selectedComplaintRoutePath}
              lat={selectedComplaintPath[0]?.lat}
              lng={selectedComplaintPath[0]?.lng}
              height={320}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

