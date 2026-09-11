import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Attendee');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name, email, role }, 'mock-jwt-token');
    navigate('/events');
  };

  return (
    <div className="container" style={{ maxWidth: '400px' }}>
      <div className="card">
        <h2>Attendee Registration</h2>
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input className="input-field" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Hema Sri" />

          <label>Email Address</label>
          <input className="input-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@klh.edu.in" />

          <label>Role Assignment</label>
          <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Attendee">Attendee</option>
            <option value="Staff">Staff</option>
            <option value="Organizer">Organizer</option>
          </select>

          <button className="btn" type="submit" style={{ width: '100%', marginTop: '10px' }}>Complete Registration</button>
        </form>
        <p style={{ fontSize: '14px', textAlign: 'center', marginTop: '15px' }}>
          Already registered? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}