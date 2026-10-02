import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import SearchFilter from '../components/SearchFilter';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  // Store tickets as an object: { [eventId]: ticketCode }
  const [tickets, setTickets] = useState({});
  const [activeModalTicket, setActiveModalTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await API.get('/events');
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || e.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleRegister = async (event) => {
    try {
      const { data } = await API.post(`/events/${event.id}/register`, {
        userId: user?.id || 1
      });

      const ticketCode = data.ticketCode || data.ticket_code;

      // Save ticket code mapped to event ID
      setTickets((prev) => ({
        ...prev,
        [event.id]: ticketCode
      }));

      // Open ticket & QR modal immediately
      setActiveModalTicket({
        eventTitle: event.title,
        ticketCode: ticketCode,
        date: event.date,
        venue: event.venue
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading events from database...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Upcoming Events</h2>
      <SearchFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      />

      <div className="grid">
        {filteredEvents.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>
            No events found. Publish one from "Create Event".
          </p>
        ) : (
          filteredEvents.map((event) => {
            const ticketCode = tickets[event.id];
            const isRegistered = Boolean(ticketCode);

            return (
              <div key={event.id} className="card">
                <span className="badge badge-role">{event.category}</span>
                <h3 style={{ margin: '10px 0 5px' }}>{event.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                  📅 {event.date} | 📍 {event.venue}
                </p>
                <p style={{ fontSize: '14px' }}>Capacity: {event.capacity} seats</p>

                {user?.role === 'Attendee' && (
                  <div style={{ marginTop: '12px' }}>
                    {isRegistered ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn"
                          disabled
                          style={{
                            flex: 1,
                            background: 'var(--success)',
                            cursor: 'default',
                            opacity: 0.95
                          }}
                        >
                          ✓ Registered
                        </button>
                        <button
                          className="btn"
                          style={{
                            background: '#0f172a',
                            color: '#fff',
                            whiteSpace: 'nowrap'
                          }}
                          onClick={() =>
                            setActiveModalTicket({
                              eventTitle: event.title,
                              ticketCode: ticketCode,
                              date: event.date,
                              venue: event.venue
                            })
                          }
                        >
                          View QR
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn"
                        style={{
                          width: '100%',
                          background: 'var(--accent)'
                        }}
                        onClick={() => handleRegister(event)}
                      >
                        Register for Event
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Ticket & QR Code Modal */}
      {activeModalTicket && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <div
              style={{
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  color: '#64748b'
                }}
              >
                Event Pass
              </span>
              <h3 style={{ margin: '4px 0 0', color: '#0f172a' }}>
                {activeModalTicket.eventTitle}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                📅 {activeModalTicket.date} | 📍 {activeModalTicket.venue}
              </p>
            </div>

            <div
              style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                display: 'inline-block'
              }}
            >
              <QRCodeSVG
                value={activeModalTicket.ticketCode}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <div
                style={{
                  fontSize: '12px',
                  color: '#64748b',
                  textTransform: 'uppercase'
                }}
              >
                Ticket Number
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  color: '#0f172a',
                  margin: '4px 0'
                }}
              >
                {activeModalTicket.ticketCode}
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 16px' }}>
              Present this QR code or ticket number at the check-in desk.
            </p>

            <button
              className="btn"
              style={{ width: '100%', background: 'var(--accent)' }}
              onClick={() => setActiveModalTicket(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '16px'
};

const modalCardStyle = {
  background: '#ffffff',
  padding: '24px',
  borderRadius: '12px',
  maxWidth: '380px',
  width: '100%',
  textAlign: 'center',
  boxShadow:
    '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
};