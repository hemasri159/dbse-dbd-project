import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../services/api';

export default function QRCheckIn({ setAuditLogs }) {
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 220 }, false);

    scanner.render(
      (result) => {
        handleCheckIn(result);
        scanner.clear();
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const handleCheckIn = async (code) => {
    setErrorMsg('');
    try {
      const { data } = await API.post('/checkin', { ticket_code: code });
      setScannedResult(code);

      if (setAuditLogs) {
        setAuditLogs((prev) => [
          {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            user: 'Staff',
            action: data.message
          },
          ...prev
        ]);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-in failed. Please verify code.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', textAlign: 'center' }}>
      <div className="card">
        <h2>QR-Based Check-In</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Scan attendee entry tickets for automated validation</p>

        <div id="reader"></div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '15px' }}>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Manual Code Override (Testing Mode)</p>
          <input
            className="input-field"
            placeholder="Enter Ticket Code (e.g., TCK-901)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button
            className="btn"
            style={{ width: '100%' }}
            onClick={() => handleCheckIn(manualCode || 'TCK-8812')}
          >
            Submit Check-In
          </button>
        </div>

        {errorMsg && (
          <div style={{ marginTop: '20px', padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {scannedResult && !errorMsg && (
          <div style={{ marginTop: '20px', padding: '12px', background: '#dcfce7', color: '#15803d', borderRadius: '6px' }}>
            ✓ Checked-In Ticket: <strong>{scannedResult}</strong>
          </div>
        )}
      </div>
    </div>
  );
}