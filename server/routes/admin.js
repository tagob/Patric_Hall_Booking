import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Hall from '../models/Hall.js';
import pool from '../config/database.js';
import { startOfDay, subDays } from 'date-fns';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 30);

    // Get total bookings
    const [totalBookingsResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM hall_bookings'
    );
    const totalBookings = totalBookingsResult[0].count;

    // Get active users (users with bookings in last 30 days)
    const [activeUsersResult] = await pool.execute(
      `SELECT COUNT(DISTINCT CONCAT(user_id, '-', user_type)) as count 
       FROM hall_bookings 
       WHERE created_at >= ?`,
      [thirtyDaysAgo]
    );
    const activeUsers = activeUsersResult[0].count;

    // Get total halls
    const [totalHallsResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM halls WHERE is_active = true'
    );
    const totalHalls = totalHallsResult[0].count;

    // Get booking rate
    const totalSlots = totalHalls * 12 * 30; // 12 hours per day, 30 days
    const bookingRate = ((totalBookings / totalSlots) * 100).toFixed(1);

    // Get popular halls
    const [popularHalls] = await pool.execute(
      `SELECT h.name, h.location, COUNT(*) as bookings
       FROM hall_bookings b
       JOIN halls h ON b.hall_id = h.id
       WHERE b.status != 'cancelled'
       AND b.created_at >= ?
       GROUP BY h.id
       ORDER BY bookings DESC
       LIMIT 5`,
      [thirtyDaysAgo]
    );

    // Get upcoming bookings
    const [upcomingBookings] = await pool.execute(
      `SELECT b.*, h.name as hall_name, h.location as hall_location,
              CASE 
                WHEN b.user_type = 'admin' THEN au.name
                ELSE su.name
              END as user_name
       FROM hall_bookings b
       JOIN halls h ON b.hall_id = h.id
       LEFT JOIN admin_users au ON b.user_id = au.id AND b.user_type = 'admin'
       LEFT JOIN staff_users su ON b.user_id = su.id AND b.user_type = 'staff'
       WHERE b.date >= CURDATE()
       AND b.status != 'cancelled'
       ORDER BY b.date ASC, b.start_time ASC
       LIMIT 5`
    );

    // Get booking trends
    const [bookingTrends] = await pool.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM hall_bookings
       WHERE created_at >= ?
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [thirtyDaysAgo]
    );

    res.json({
      totalBookings,
      activeUsers,
      totalHalls,
      bookingRate,
      popularHalls,
      upcomingBookings,
      bookingTrends
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

export default router;