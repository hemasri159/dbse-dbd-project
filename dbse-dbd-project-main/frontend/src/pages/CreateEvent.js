import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function CreateEvent({ setEvents, setAuditLogs }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/events', {
        title,
        category,
        date,
        venue,
        capacity: Number(capacity)
      });

      if (setEvents) {
        setEvents((prev) => [...prev, data]);
      }

      if (setAuditLogs) {
        setAuditLogs((prev) => [
          {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            user: 'Organizer',
            action: `Created Event: "${title}"`
          },
          ...prev
        ]);
      }

      navigate('/events');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create event');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '550px' }}>
      <div className="card">
        <h2>Event Lifecycle Management</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Publish and manage new event instances</p>

        <form onSubmit={handleSubmit}>
          <label>Event Title</label>
          <input
            className="input-field"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., National AI Conference"
          />

          <label>Category</label>
          <select
            className="input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Technology">Technology</option>
            <option value="Workshops">Workshops</option>
            <option value="Management">Management</option>
          </select>

          <label>Date</label>
          <input
            className="input-field"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label>Venue Location</label>
          <input
            className="input-field"
            required
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g., Campus Auditorium"
          />

          <label>Capacity</label>
          <input
            className="input-field"
            type="number"
            required
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="150"
          />

          <button className="btn" type="submit" style={{ width: '100%', marginTop: '10px' }}>
            Publish Event
          </button>
        </form>
      </div>
    </div>
  );
}