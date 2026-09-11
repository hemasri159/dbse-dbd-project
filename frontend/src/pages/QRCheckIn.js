import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRCheckIn({ setAuditLogs }) {
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 220 }, false);

    scanner.render(
      (result) => {
        handleSuccess(result);
        scanner.clear();
      },
      () => {}
    );

    return () => { scanner.clear().catch(() => {}); };
  }, []);

  const handleSuccess = (code) => {
    setScannedResult(code);
    setAuditLogs((prev) => [
      { id: Date.now(), timestamp: new Date().toLocaleTimeString(), user: 'Staff', action: `QR Entry Checked-In for Ticket ID: #${code}` },
      ...prev
    ]);
  };

  return (
    <div className="container" style={{ maxWidth: '480px', textAlign: 'center' }}>
      <div className="card">
        <h2>QR-Based Check-In</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Scan attendee entry tickets for automated validation</p>

        <div id="reader"></div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '15px' }}>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Manual Code Override (Testing Mode)</p>
          <input className="input-field" placeholder="Enter Ticket Code (e.g., TCK-901)" value={manualCode} onChange={(e) => setManualCode(e.target.value)} />
          <button className="btn" style={{ width: '100%' }} onClick={() => handleSuccess(manualCode || 'TCK-8812')}>Submit Check-In</button>
        </div>

        {scannedResult && (
          <div style={{ marginTop: '20px', padding: '12px', background: '#dcfce7', color: '#15803d', borderRadius: '6px' }}>
            ✓ Checked-In Ticket: <strong>{scannedResult}</strong>
          </div>
        )}
      </div>
    </div>
  );
}