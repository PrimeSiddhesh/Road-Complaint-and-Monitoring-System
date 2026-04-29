import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { complaintService } from '../services/api';
import { formatDate } from '../utils/formatDate';
import ComplaintCard from '../components/ComplaintCard';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaints, statusFilter, locationFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getComplaints();
      setComplaints(response.complaints || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = complaints;

    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(c => 
        c.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1>Welcome, {user?.name || 'User'}!</h1>
            <p>Manage and track all your road complaints from here</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-controls">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <input
            type="text"
            placeholder="Search location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />

          <button onClick={() => { setStatusFilter(''); setLocationFilter(''); }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Complaints List */}
      <div className="complaints-section">
        <div className="section-header">
          <h2>Your Complaints</h2>
          <a href="/upload" className="btn btn-primary">+ Submit New Complaint</a>
        </div>

        {loading ? (
          <Loader message="Loading your complaints..." />
        ) : filteredComplaints.length > 0 ? (
          <div className="complaints-grid">
            {filteredComplaints.map(complaint => (
              <ComplaintCard 
                key={complaint._id || complaint.id} 
                complaint={complaint}
                onClick={() => navigate(`/complaint/${complaint._id || complaint.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>You haven't submitted any complaints yet.</p>
            <a href="/upload" className="btn btn-primary">Submit Your First Complaint</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
