import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import API from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    checkInRate: '0%',
    activeEvents: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await API.get('/analytics');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };
    fetchAnalytics();
  }, []);

  const barData = {
    labels: ['Tech Conf 2026', 'Annual Hackathon', 'Leadership Summit'],
    datasets: [
      { label: 'Registered', data: [150, 110, 80], backgroundColor: 'rgba(37, 99, 235, 0.7)' },
      { label: 'Checked In', data: [120, 95, 65], backgroundColor: 'rgba(22, 163, 74, 0.7)' }
    ]
  };

  const pieData = {
    labels: ['Technology', 'Workshops', 'Management'],
    datasets: [{ data: [55, 25, 20], backgroundColor: ['#2563eb', '#16a34a', '#f59e0b'] }]
  };

  return (
    <div className="container">
      <h2>Analytics & Performance Dashboard</h2>

      <div className="grid" style={{ marginBottom: '20px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--accent)', margin: 0 }}>{stats.totalRegistrations}</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Total Registrations</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--success)', margin: 0 }}>{stats.checkInRate}</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Average Check-In Rate</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#f59e0b', margin: 0 }}>{stats.activeEvents}</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>Active Managed Events</p>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Attendance Rate Breakdown</h3>
          <Bar data={barData} />
        </div>
        <div className="card">
          <h3>Category Distribution</h3>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
}