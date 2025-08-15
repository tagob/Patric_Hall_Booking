import pool from '../config/database.js';

export default {
  findAll: async () => {
    const [rows] = await pool.execute(
      'SELECT * FROM halls WHERE is_active = true'
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM halls WHERE id = ? AND is_active = true',
      [id]
    );
    return rows[0];
  },

  create: async (hallData) => {
    const { name, location, capacity, amenities, description, imageUrl } = hallData;
    
    const [result] = await pool.execute(
      'INSERT INTO halls (name, location, capacity, amenities, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, location, capacity, JSON.stringify(amenities), description, imageUrl]
    );
    
    return { id: result.insertId, ...hallData };
  },

  update: async (id, hallData) => {
    const { name, location, capacity, amenities, description, imageUrl, isActive } = hallData;
    
    await pool.execute(
      `UPDATE halls 
       SET name = ?, location = ?, capacity = ?, amenities = ?, 
           description = ?, image_url = ?, is_active = ?
       WHERE id = ?`,
      [name, location, capacity, JSON.stringify(amenities), description, imageUrl, isActive, id]
    );
    
    return { id, ...hallData };
  },

  delete: async (id) => {
    await pool.execute(
      'UPDATE halls SET is_active = false WHERE id = ?',
      [id]
    );
  }
};