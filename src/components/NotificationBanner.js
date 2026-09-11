import React from 'react';

export default function NotificationBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{ background: '#2563eb', color: 'white', padding: '8px', textAlign: 'center', fontSize: '13px' }}>
      🔔 <strong>Notification:</strong> {message}
    </div>
  );
}