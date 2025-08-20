const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hall_booking_system'
};

let db;

async function initializeDatabase() {
  try {
    // Create connection without database first
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.end();

    // Connect to the database
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');

    // Create tables
    await createTables();
    await seedData();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

async function createTables() {
  // Users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('hod', 'admin') NOT NULL,
      department_id INT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Departments table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(10) UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Halls table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS halls (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      capacity INT NOT NULL,
      amenities JSON,
      description TEXT,
      image_url VARCHAR(500),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Booking requests table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS booking_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      hall_id INT NOT NULL,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      purpose TEXT NOT NULL,
      attendees INT NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      approved_by INT NULL,
      approved_at TIMESTAMP NULL,
      rejection_reason TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (hall_id) REFERENCES halls(id),
      FOREIGN KEY (approved_by) REFERENCES users(id)
    )
  `);

  // Add foreign key constraint for users table
  await db.execute(`
    ALTER TABLE users 
    ADD CONSTRAINT fk_user_department 
    FOREIGN KEY (department_id) REFERENCES departments(id)
  `).catch(() => {}); // Ignore if constraint already exists
}

async function seedData() {
  // Check if data already exists
  const [existingUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0].count > 0) return;

  // Insert departments
  const departments = [
    ['Computer Science', 'CS'],
    ['Business Management', 'BMS'],
    ['Commerce', 'COM'],
    ['Arts', 'ARTS'],
    ['Science', 'SCI']
  ];

  for (const [name, code] of departments) {
    await db.execute(
      'INSERT INTO departments (name, code) VALUES (?, ?)',
      [name, code]
    );
  }

  // Insert halls
  const halls = [
    ['A-Block Conference Hall', '1st Floor, A Block', 200, '["Projector", "Sound System", "Air Conditioning"]', 'Modern conference hall with state-of-the-art facilities'],
    ['B-Block Auditorium', 'Ground Floor, B Block', 500, '["Stage", "Professional Sound System", "Lighting System", "Green Room"]', 'Large auditorium perfect for major events'],
    ['Delany Hall', 'Main Building', 300, '["Projector", "Sound System", "Stage"]', 'Traditional hall suitable for various events'],
    ['C Block Fintan Hall', 'Ground Floor, C Block', 150, '["Projector", "Air Conditioning", "Sound System"]', 'Intimate setting for smaller gatherings'],
    ['Board Room', 'Administrative Block', 30, '["Video Conferencing", "Smart Display", "Executive Seating"]', 'Executive meeting room with premium facilities']
  ];

  for (const [name, location, capacity, amenities, description] of halls) {
    await db.execute(
      'INSERT INTO halls (name, location, capacity, amenities, description) VALUES (?, ?, ?, ?, ?)',
      [name, location, capacity, amenities, description]
    );
  }

  // Insert default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['System Admin', 'admin@patrician.edu', hashedPassword, 'admin']
  );

  // Insert sample HOD users
  const hodUsers = [
    ['Dr. John Smith', 'john.smith@patrician.edu', 'hod123', 1],
    ['Dr. Sarah Johnson', 'sarah.johnson@patrician.edu', 'hod123', 2],
    ['Dr. Michael Brown', 'michael.brown@patrician.edu', 'hod123', 3]
  ];

  for (const [name, email, password, deptId] of hodUsers) {
    const hashedPwd = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (name, email, password, role, department_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPwd, 'hod', deptId]
    );
  }

  console.log('Database seeded successfully');
}

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role-based access middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.execute(
      `SELECT u.*, d.name as department_name, d.code as department_code 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.email = ? AND u.is_active = true`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        department_id: user.department_id 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department_name,
        department_code: user.department_code
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT u.*, d.name as department_name, d.code as department_code 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department_name,
      department_code: user.department_code
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// HOD Routes
app.post('/api/hod/request-booking', authenticateToken, requireRole(['hod']), async (req, res) => {
  try {
    const { hall_id, date, start_time, end_time, purpose, attendees } = req.body;

    // Check for conflicts
    const [conflicts] = await db.execute(
      `SELECT * FROM booking_requests 
       WHERE hall_id = ? AND date = ? AND status IN ('pending', 'approved')
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [hall_id, date, start_time, start_time, end_time, end_time]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ error: 'Time slot conflicts with existing booking' });
    }

    const [result] = await db.execute(
      `INSERT INTO booking_requests (user_id, hall_id, date, start_time, end_time, purpose, attendees)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, hall_id, date, start_time, end_time, purpose, attendees]
    );

    res.json({ 
      message: 'Booking request submitted successfully',
      booking_id: result.insertId 
    });
  } catch (error) {
    console.error('Booking request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/hod/my-requests', authenticateToken, requireRole(['hod']), async (req, res) => {
  try {
    const [bookings] = await db.execute(
      `SELECT br.*, h.name as hall_name, h.location as hall_location,
              approver.name as approved_by_name
       FROM booking_requests br
       JOIN halls h ON br.hall_id = h.id
       LEFT JOIN users approver ON br.approved_by = approver.id
       WHERE br.user_id = ?
       ORDER BY br.created_at DESC`,
      [req.user.id]
    );

    res.json(bookings);
  } catch (error) {
    console.error('My requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Routes
app.get('/api/admin/manage-hod', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [hods] = await db.execute(
      `SELECT u.*, d.name as department_name, d.code as department_code
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.role = 'hod'
       ORDER BY u.name`
    );

    res.json(hods);
  } catch (error) {
    console.error('Manage HOD error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/create-hod', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, department_id } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role, department_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'hod', department_id]
    );

    res.json({ 
      message: 'HOD created successfully',
      user_id: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Create HOD error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/pending-requests', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [requests] = await db.execute(
      `SELECT br.*, h.name as hall_name, h.location as hall_location,
              u.name as requester_name, u.email as requester_email,
              d.name as department_name
       FROM booking_requests br
       JOIN halls h ON br.hall_id = h.id
       JOIN users u ON br.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE br.status = 'pending'
       ORDER BY br.created_at ASC`
    );

    res.json(requests);
  } catch (error) {
    console.error('Pending requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/approve/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const bookingId = req.params.id;

    await db.execute(
      `UPDATE booking_requests 
       SET status = 'approved', approved_by = ?, approved_at = NOW()
       WHERE id = ? AND status = 'pending'`,
      [req.user.id, bookingId]
    );

    res.json({ message: 'Booking approved successfully' });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/reject/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { reason } = req.body;

    await db.execute(
      `UPDATE booking_requests 
       SET status = 'rejected', approved_by = ?, approved_at = NOW(), rejection_reason = ?
       WHERE id = ? AND status = 'pending'`,
      [req.user.id, reason, bookingId]
    );

    res.json({ message: 'Booking rejected successfully' });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/logs', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [logs] = await db.execute(
      `SELECT br.*, h.name as hall_name, h.location as hall_location,
              u.name as requester_name, u.email as requester_email,
              d.name as department_name,
              approver.name as approved_by_name
       FROM booking_requests br
       JOIN halls h ON br.hall_id = h.id
       JOIN users u ON br.user_id = u.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN users approver ON br.approved_by = approver.id
       ORDER BY br.updated_at DESC
       LIMIT 100`
    );

    res.json(logs);
  } catch (error) {
    console.error('Logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/reports', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Get booking statistics
    const [totalBookings] = await db.execute(
      'SELECT COUNT(*) as total FROM booking_requests'
    );

    const [pendingBookings] = await db.execute(
      'SELECT COUNT(*) as pending FROM booking_requests WHERE status = "pending"'
    );

    const [approvedBookings] = await db.execute(
      'SELECT COUNT(*) as approved FROM booking_requests WHERE status = "approved"'
    );

    const [rejectedBookings] = await db.execute(
      'SELECT COUNT(*) as rejected FROM booking_requests WHERE status = "rejected"'
    );

    // Get popular halls
    const [popularHalls] = await db.execute(
      `SELECT h.name, h.location, COUNT(br.id) as booking_count
       FROM halls h
       LEFT JOIN booking_requests br ON h.id = br.hall_id
       GROUP BY h.id, h.name, h.location
       ORDER BY booking_count DESC
       LIMIT 5`
    );

    // Get department-wise bookings
    const [departmentStats] = await db.execute(
      `SELECT d.name as department, COUNT(br.id) as booking_count
       FROM departments d
       LEFT JOIN users u ON d.id = u.department_id
       LEFT JOIN booking_requests br ON u.id = br.user_id
       GROUP BY d.id, d.name
       ORDER BY booking_count DESC`
    );

    res.json({
      totalBookings: totalBookings[0].total,
      pendingBookings: pendingBookings[0].pending,
      approvedBookings: approvedBookings[0].approved,
      rejectedBookings: rejectedBookings[0].rejected,
      popularHalls,
      departmentStats
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get halls
app.get('/api/halls', async (req, res) => {
  try {
    const [halls] = await db.execute(
      'SELECT * FROM halls WHERE is_active = true ORDER BY name'
    );
    res.json(halls);
  } catch (error) {
    console.error('Get halls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get departments
app.get('/api/departments', async (req, res) => {
  try {
    const [departments] = await db.execute(
      'SELECT * FROM departments WHERE is_active = true ORDER BY name'
    );
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});