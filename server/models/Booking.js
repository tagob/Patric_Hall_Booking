import pool from '../config/database.js';

export default {
  create: async (bookingData) => {
    const { hallId, userId, userType, date, startTime, endTime, purpose, attendees } = bookingData;
    
    const [result] = await pool.execute(
      `INSERT INTO hall_bookings 
       (hall_id, user_id, user_type, date, start_time, end_time, purpose, attendees)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [hallId, userId, userType, date, startTime, endTime, purpose, attendees]
    );
    
    return { id: result.insertId, ...bookingData };
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT b.*, h.name as hall_name, h.location as hall_location,
              CASE 
                WHEN b.user_type = 'admin' THEN au.name
                ELSE su.name
              END as user_name
       FROM hall_bookings b
       LEFT JOIN halls h ON b.hall_id = h.id
       LEFT JOIN admin_users au ON b.user_id = au.id AND b.user_type = 'admin'
       LEFT JOIN staff_users su ON b.user_id = su.id AND b.user_type = 'staff'
       WHERE b.id = ?`,
      [id]
    );
    return rows[0];
  },

  findByUser: async (userId, userType, options = {}) => {
    const limit = options.limit || 10;
    const offset = ((options.page || 1) - 1) * limit;
    const status = options.status;
    
    let query = `
      SELECT b.*, h.name as hall_name, h.location as hall_location
      FROM hall_bookings b
      LEFT JOIN halls h ON b.hall_id = h.id
      WHERE b.user_id = ? AND b.user_type = ?
    `;
    
    const params = [userId, userType];
    
    if (status && status !== 'all') {
      query += ' AND b.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY b.date DESC, b.start_time DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  checkOverlap: async (hallId, date, startTime, endTime, excludeId = null) => {
    let query = `
      SELECT id FROM hall_bookings
      WHERE hall_id = ? AND date = ?
      AND status != 'cancelled'
      AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))
    `;
    
    const params = [hallId, date, endTime, startTime, endTime, startTime];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  },

  updateStatus: async (id, status) => {
    await pool.execute(
      'UPDATE hall_bookings SET status = ? WHERE id = ?',
      [status, id]
    );
  }
};