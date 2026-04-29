import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/api';
import Loader from '../components/Loader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Stats = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getComplaints();
      const complaints = response.complaints || [];

      setStats({
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading your statistics..." />;

  const chartData = {
    labels: ['Pending', 'In Progress', 'Resolved'],
    datasets: [
      {
        label: 'Number of Complaints',
        data: [stats.pending, stats.inProgress, stats.resolved],
        backgroundColor: [
          'rgba(245, 158, 11, 0.7)',
          'rgba(56, 189, 248, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderColor: [
          'rgba(245, 158, 11, 1)',
          'rgba(56, 189, 248, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#f8fafc' } },
      title: { display: false },
    },
    scales: {
      y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="section" style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Complaint Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of your complaint activity</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="service-card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.total}</h2>
          <p>Total Complaints</p>
        </div>
        <div className="service-card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: '#fbbf24' }}>{stats.pending}</h2>
          <p>Pending</p>
        </div>
        <div className="service-card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: '#38bdf8' }}>{stats.inProgress}</h2>
          <p>In Progress</p>
        </div>
        <div className="service-card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', color: '#10b981' }}>{stats.resolved}</h2>
          <p>Resolved</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="section" style={{ height: '400px' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Status Distribution</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="section" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Status Proportion</h3>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
             <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#f8fafc' } } } }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
