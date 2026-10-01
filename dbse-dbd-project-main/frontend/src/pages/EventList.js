import React, { useState, useEffect } from 'react';
import SearchFilter from '../components/SearchFilter';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [registeredIds, setRegisteredIds] = useState([]);
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

  const toggleRegister = async (eventId) => {
    if (registeredIds.includes(eventId)) {
      setRegisteredIds((prev) => prev.filter((id) => id !== eventId));
      return;
    }

    try {
      const { data } = await API.post(`/events/${eventId}/register`, {
        userId: user?.id || 1
      });
      alert(`Registration Successful! Your Ticket Code: ${data.ticketCode}`);
      setRegisteredIds((prev) => [...prev, eventId]);
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  if (loading) {
    return <div className="container"><p>Loading events from database...</p></div>;
  }

  return (
    <div className="container">
      <h2>Upcoming Events</h2>
      <SearchFilter search={search} setSearch={setSearch} category={category} setCategory={setCategory} />

      <div className="grid">
        {filteredEvents.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No events found. Publish one from "Create Event".</p>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="card">
              <span className="badge badge-role">{event.category}</span>
              <h3 style={{ margin: '10px 0 5px' }}>{event.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                📅 {event.date} | 📍 {event.venue}
              </p>
              <p style={{ fontSize: '14px' }}>Capacity: {event.capacity} seats</p>

              {user?.role === 'Attendee' && (
                <button
                  className="btn"
                  style={{
                    width: '100%',
                    background: registeredIds.includes(event.id) ? 'var(--success)' : 'var(--accent)'
                  }}
                  onClick={() => toggleRegister(event.id)}
                >
                  {registeredIds.includes(event.id) ? '✓ Registered' : 'Register for Event'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}