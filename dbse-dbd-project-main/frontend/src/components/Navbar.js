import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{ background: '#0f172a', color: 'white', padding: '16px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
        Event Portal <span style={{ fontSize: '12px', color: '#94a3b8' }}>| Management & Analytics</span>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/events" style={{ color: 'white', textDecoration: 'none' }}>Events</Link>

        {user?.role === 'Organizer' && (
          <>
            <Link to="/create-event" style={{ color: 'white', textDecoration: 'none' }}>Create Event</Link>
            <Link to="/analytics" style={{ color: 'white', textDecoration: 'none' }}>Analytics</Link>
            <Link to="/audit-logs" style={{ color: 'white', textDecoration: 'none' }}>Audit Logs</Link>
          </>
        )}

        {(user?.role === 'Organizer' || user?.role === 'Staff') && (
          <Link to="/checkin" style={{ color: 'white', textDecoration: 'none' }}>QR Check-In</Link>
        )}

        {user ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="badge badge-role">{user.role}: {user.name}</span>
            <button className="btn" style={{ background: '#ef4444', padding: '6px 12px' }} onClick={() => { logout(); navigate('/login'); }}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login"><button className="btn">Login</button></Link>
        )}
      </div>
    </nav>
  );
}