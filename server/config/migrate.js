import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from './database.js';

dotenv.config();

const tables = [
  `CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
  )`,
  
  `CREATE TABLE IF NOT EXISTS staff_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_password_token)
  )`,
  
  `CREATE TABLE IF NOT EXISTS halls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    amenities JSON,
    description TEXT,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_location (location),
    INDEX idx_is_active (is_active)
  )`,
  
  `CREATE TABLE IF NOT EXISTS hall_bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hall_id INT NOT NULL,
    user_id INT NOT NULL,
    user_type ENUM('admin', 'staff') NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT NOT NULL,
    attendees INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hall_id) REFERENCES halls(id),
    INDEX idx_hall_date (hall_id, date),
    INDEX idx_user (user_id, user_type),
    INDEX idx_status (status)
  )`
];

const seedData = async () => {
  try {
    // Seed admin users
    const adminUsers = [
      {
        name: 'System Admin',
        email: 'admin123@gmail.com',
        password: 'Admin@123'
      }
    ];

    for (const admin of adminUsers) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await pool.execute(
        'INSERT IGNORE INTO admin_users (name, email, password) VALUES (?, ?, ?)',
        [admin.name, admin.email, hashedPassword]
      );
    }

    // Seed staff users
    const staffPassword = await bcrypt.hash('Staff123.', 10);
    const staffUsers = [
      ['Staff One', 'staff1@example.com', staffPassword, 'Academic'],
      ['Staff Two', 'staff2@example.com', staffPassword, 'Academic'],
      ['Staff Three', 'staff3@example.com', staffPassword, 'Academic']
    ];

    for (const [name, email, password, department] of staffUsers) {
      await pool.execute(
        'INSERT IGNORE INTO staff_users (name, email, password, department) VALUES (?, ?, ?, ?)',
        [name, email, password, department]
      );
    }

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

async function migrate() {
  try {
    // Create tables
    for (const table of tables) {
      await pool.query(table);
    }

    // Seed data
    await seedData();
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export default migrate;