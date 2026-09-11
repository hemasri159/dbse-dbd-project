import React, { useState } from 'react';
import SearchFilter from '../components/SearchFilter';
import { useAuth } from '../context/AuthContext';

export default function EventList({ events }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [registeredIds, setRegisteredIds] = useState([]);
  const { user } = useAuth();

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || e.category === category;
    return matchesSearch && matchesCategory;
  });

  const toggleRegister = (id) => {
    setRegisteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="container">
      <h2>Upcoming Events</h2>
      <SearchFilter search={search} setSearch={setSearch} category={category} setCategory={setCategory} />

      <div className="grid">
        {filteredEvents.map((event) => (
          <div key={event.id} className="card">
            <span className="badge badge-role">{event.category}</span>
            <h3 style={{ margin: '10px 0 5px' }}>{event.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>📅 {event.date} | 📍 {event.venue}</p>
            <p style={{ fontSize: '14px' }}>Capacity: {event.capacity} seats</p>

            {user?.role === 'Attendee' && (
              <button
                className="btn"
                style={{ width: '100%', background: registeredIds.includes(event.id) ? 'var(--success)' : 'var(--accent)' }}
                onClick={() => toggleRegister(event.id)}
              >
                {registeredIds.includes(event.id) ? '✓ Registered' : 'Register for Event'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}