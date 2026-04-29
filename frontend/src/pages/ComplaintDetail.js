import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService, API_ASSET_BASE_URL } from '../services/api';
import { formatDate } from '../utils/formatDate';
import Loader from '../components/Loader';
import './adminDashboard.css'; // reuse styles, e.g. badge

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getComplaintById(id);
        setComplaint(res.complaint || null);
      } catch (err) {
        console.error('fetch complaint detail', err);
        // if backend returns unauthorized, send user back to dashboard
        if (err.message && err.message.toLowerCase().includes('unauthorized')) {
          navigate('/dashboard', { replace: true });
          return;
        }
        setError(err.message || 'Failed to load complaint');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) return <Loader message="Loading complaint details..." />;

  if (error) return <div className="error-message">{error}</div>;

  if (!complaint) return <div className="no-data">Complaint not found.</div>;

  return (
    <div className="complaint-detail-page">
      <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>← Back</button>
      <h1>Complaint #{complaint.id || complaint._id}</h1>
      <div className="status-badge" style={{ backgroundColor: complaint.status === 'Resolved' ? '#4CAF50' : complaint.status === 'In Progress' ? '#2196F3' : '#FFC107' }}>
        {complaint.status}
      </div>
      <div className="detail-section">
        <p><strong>Location:</strong> {complaint.location}</p>
        <p><strong>Description:</strong> {complaint.description}</p>
        <p><strong>Severity:</strong> {complaint.severity}</p>
        <p><strong>Flags:</strong> {complaint.flags || 'None'}</p>
      </div>
      {complaint.image && (
        <div className="detail-image">
          <img 
            src={complaint.image.startsWith('http') ? complaint.image : `${API_ASSET_BASE_URL}/uploads/${complaint.image}`}
            alt="complaint"
          />
        </div>
      )}
      <div className="timeline">
        <h3>History</h3>
        <ul>
          <li>Submitted on {formatDate(complaint.createdAt)}</li>
          {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
            <li>Last updated on {formatDate(complaint.updatedAt)} (status: {complaint.status})</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ComplaintDetail;
