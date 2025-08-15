import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export default {
  findAdminByEmail: async (email) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM admin_users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding admin:', error);
      throw error;
    }
  },

  findStaffByEmail: async (email) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM staff_users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding staff:', error);
      throw error;
    }
  },

  findById: async (id, type) => {
    try {
      const table = type === 'admin' ? 'admin_users' : 'staff_users';
      const [rows] = await pool.execute(
        `SELECT id, name, email, ${type === 'staff' ? 'department,' : ''} created_at 
         FROM ${table} WHERE id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  },

  comparePassword: async (password, hashedPassword) => {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw error;
    }
  },

  updateResetToken: async (email, token, expires) => {
    try {
      await pool.execute(
        'UPDATE staff_users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?',
        [token, expires, email]
      );
    } catch (error) {
      console.error('Error updating reset token:', error);
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.execute(
        'UPDATE staff_users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = ? AND reset_password_expires > NOW()',
        [hashedPassword, token]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
};