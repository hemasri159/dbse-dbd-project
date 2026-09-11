import React from 'react';

export default function AuditLogs({ auditLogs }) {
  return (
    <div className="container">
      <h2>System Audit Logs</h2>
      <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Track administrative activity and operational accountability records</p>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User Role</th>
              <th>Action Details</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td><span className="badge badge-role">{log.user}</span></td>
                <td>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}