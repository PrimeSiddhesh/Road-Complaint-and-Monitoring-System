import React from 'react';
import { formatDate } from '../utils/formatDate';

const ComplaintCard = ({ complaint, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFC107';
      case 'In Progress':
        return '#2196F3';
      case 'Resolved':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  return (
    <div className="complaint-card" onClick={onClick}>
      <div className="complaint-header">
        <h3>Complaint #{complaint._id || complaint.id}</h3>
        <span 
          className="status-badge" 
          style={{ background: getStatusColor(complaint.status) }}
        >
          {complaint.status}
        </span>
      </div>
      
      <div className="complaint-body">
        <p className="complaint-location">📍 {complaint.location}</p>
        <p className="complaint-date">📅 {formatDate(complaint.createdAt)}</p>
      </div>
    </div>
  );
};

export default ComplaintCard;
