import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPool } from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create MySQL connection pool
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hall_booking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Venues routes
app.get('/api/venues', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM halls WHERE is_active = true ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Error fetching venues' });
  }
});

app.get('/api/venues/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM halls WHERE id = ? AND is_active = true',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({ message: 'Error fetching venue' });
  }
});

// Bookings routes
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { hallId, date, startTime, endTime, purpose, attendees } = req.body;
    const [result] = await pool.query(
      `INSERT INTO bookings (hall_id, user_id, date, start_time, end_time, purpose, attendees)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [hallId, req.user.id, date, startTime, endTime, purpose, attendees]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, h.name as hall_name, h.location as hall_location
       FROM bookings b
       JOIN halls h ON b.hall_id = h.id
       WHERE b.user_id = ?
       ORDER BY b.date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});