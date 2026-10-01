import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationBanner from './components/NotificationBanner';

import Login from './pages/Login';
import Register from './pages/Register';
import EventList from './pages/EventList';
import CreateEvent from './pages/CreateEvent';
import QRCheckIn from './pages/QRCheckIn';
import AuditLogs from './pages/AuditLogs';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const initialEvents = [
  { id: 1, title: 'Tech Conference 2026', category: 'Technology', date: '2026-10-15', venue: 'Hall A', capacity: 200 },
  { id: 2, title: 'Annual Hackathon', category: 'Workshops', date: '2026-11-01', venue: 'Lab 3', capacity: 100 },
  { id: 3, title: 'Leadership Summit', category: 'Management', date: '2026-12-05', venue: 'Auditorium', capacity: 150 }
];

const initialLogs = [
  { id: 1, timestamp: '10:15 AM', user: 'Organizer', action: 'Created event: Tech Conference 2026' },
  { id: 2, timestamp: '10:30 AM', user: 'Staff', action: 'Verified QR Ticket Check-In #TCK-102' }
];

export default function App() {
  const [events, setEvents] = useState(initialEvents);
  const [auditLogs, setAuditLogs] = useState(initialLogs);

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <NotificationBanner message="Event management operations are live. QR Check-In module active." />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<EventList events={events} />} />

          <Route
            path="/create-event"
            element={
              <ProtectedRoute allowedRoles={['Organizer']}>
                <CreateEvent setEvents={setEvents} setAuditLogs={setAuditLogs} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkin"
            element={
              <ProtectedRoute allowedRoles={['Organizer', 'Staff']}>
                <QRCheckIn setAuditLogs={setAuditLogs} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['Organizer']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['Organizer']}>
                <AuditLogs auditLogs={auditLogs} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}