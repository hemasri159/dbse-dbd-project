const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./config/db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'event_portal_secret_key_2026';

// ----------------- AUTH ROUTES (Register.js & Login.js) -----------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const [result] = await db.query(
      'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
      [name, email, role || 'Attendee']
    );

    const user = { id: result.insertId, name, email, role };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, role } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);

    let user;
    if (users.length === 0) {
      // Auto-creates attendee/staff if logging in directly
      const defaultName = email.split('@')[0];
      const [insert] = await db.query(
        'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
        [defaultName, email, role]
      );
      user = { id: insert.insertId, name: defaultName, email, role };
    } else {
      user = users[0];
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- EVENTS ROUTES (EventList.js & CreateEvent.js) -----------------
app.get('/api/events', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events ORDER BY date ASC');
    // Format date field for React string rendering
    const formatted = rows.map((e) => ({
      ...e,
      date: new Date(e.date).toISOString().split('T')[0]
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { title, category, date, venue, capacity } = req.body;
    const [result] = await db.query(
      'INSERT INTO events (title, category, date, venue, capacity) VALUES (?, ?, ?, ?, ?)',
      [title, category, date, venue, capacity]
    );

    const timeString = new Date().toLocaleTimeString();
    await db.query(
      'INSERT INTO audit_logs (timestamp, user, action) VALUES (?, ?, ?)',
      [timeString, 'Organizer', `Created Event: "${title}"`]
    );

    res.status(201).json({ id: result.insertId, title, category, date, venue, capacity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- REGISTRATION & QR CHECK-IN ROUTES -----------------
app.post('/api/events/:id/register', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { userId } = req.body;
    const ticketCode = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.query(
      'INSERT INTO event_registrations (event_id, user_id, ticket_code) VALUES (?, ?, ?)',
      [eventId, userId, ticketCode]
    );

    res.json({ message: 'Registered successfully', ticketCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/checkin', async (req, res) => {
  try {
    const { ticket_code } = req.body;

    const [existing] = await db.query('SELECT * FROM check_ins WHERE ticket_code = ?', [ticket_code]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Ticket already checked in' });
    }

    await db.query('INSERT INTO check_ins (ticket_code) VALUES (?)', [ticket_code]);

    const timeString = new Date().toLocaleTimeString();
    const actionText = `QR Entry Checked-In for Ticket ID: #${ticket_code}`;
    await db.query(
      'INSERT INTO audit_logs (timestamp, user, action) VALUES (?, ?, ?)',
      [timeString, 'Staff', actionText]
    );

    res.json({ success: true, message: actionText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- AUDIT LOGS & ANALYTICS -----------------
app.get('/api/audit-logs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM audit_logs ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const [[{ totalRegistrations }]] = await db.query('SELECT COUNT(*) AS totalRegistrations FROM event_registrations');
    const [[{ totalCheckedIn }]] = await db.query('SELECT COUNT(*) AS totalCheckedIn FROM check_ins');
    const [[{ totalEvents }]] = await db.query('SELECT COUNT(*) AS totalEvents FROM events');

    const checkInRate = totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;

    res.json({
      totalRegistrations,
      checkInRate: `${checkInRate}%`,
      activeEvents: totalEvents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));