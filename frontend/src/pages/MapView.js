import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  const [complaints, setComplaints] = useState([]);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (map && complaints.length > 0) {
      displayMarkers();
    }
  }, [map, complaints]);

  useEffect(() => {
    // Initialize map
    const mapInstance = L.map('map', {
      scrollWheelZoom: false
    }).setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);
    
    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

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

  const displayMarkers = () => {
    if (!map) return;

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    let filteredComplaints = complaints;

    if (searchLocation) {
      filteredComplaints = filteredComplaints.filter(c =>
        c.location?.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    if (statusFilter) {
      filteredComplaints = filteredComplaints.filter(c => c.status === statusFilter);
    }

    filteredComplaints.forEach(complaint => {
      if (complaint.latitude && complaint.longitude) {
        const color = getColorByStatus(complaint.status);
        L.circleMarker([complaint.latitude, complaint.longitude], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        })
          .bindPopup(`<strong>${complaint.location}</strong><br>Status: ${complaint.status}`)
          .addTo(map);
      }
    });
  };

  const getColorByStatus = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFD700';
      case 'In Progress':
        return '#2196F3';
      case 'Resolved':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  const handleSearch = () => {
    displayMarkers();
  };

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Complaint Location Map</h1>
        <p>Visualize complaint locations and track road issues</p>
      </div>

      <div className="map-controls">
        <input
          type="text"
          placeholder="Search by location..."
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>

      <div id="map" className="map-container"></div>

      <div className="map-legend">
        <h3>Legend</h3>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#FFD700' }}></span> Pending
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#2196F3' }}></span> In Progress
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#4CAF50' }}></span> Resolved
        </div>
      </div>
    </div>
  );
};

export default MapView;
